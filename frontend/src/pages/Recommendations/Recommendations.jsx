import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaExclamationTriangle,
  FaFilter,
  FaLeaf,
  FaRecycle,
  FaSearch,
} from "react-icons/fa";

import {
  getRecommendations,
} from "../../services/recommendationService";

import {
  getDatasetAnalytics,
} from "../../services/analyticsService";

import RecommendationDrawer from "./RecommendationDrawer";

import "./Recommendations.css";


const firstValue = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== "",
  );


const formatNumber = (
  value,
  maximumFractionDigits = 1,
) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
  }).format(Number(value) || 0);


const titleCase = (value) =>
  String(value || "Not available")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );


const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\s+/g, " ");


/*
  Converts a value into a valid number.

  Missing values return null instead of 0.
  This prevents records without sustainability
  scores from reducing the average.
*/
const toNullableNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
};


const normalizeList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  const possibleLists = [
    response?.recommendations,
    response?.data,
    response?.results,
    response?.items,
    response?.records,
  ];

  return (
    possibleLists.find(Array.isArray) || []
  );
};


const getRecommendationClass = (
  recommendation,
) => {
  const value = normalizeKey(
    recommendation,
  );

  if (
    value.includes("donation") ||
    value.includes("reuse")
  ) {
    return "is-donation";
  }

  if (
    value.includes("repair") ||
    value.includes("upcycl")
  ) {
    return "is-reuse";
  }

  if (value.includes("chemical")) {
    return "is-chemical";
  }

  if (
    value.includes("mechanical") ||
    value.includes("fiber")
  ) {
    return "is-mechanical";
  }

  if (
    value.includes("energy") ||
    value.includes("treatment")
  ) {
    return "is-energy";
  }

  if (
    value.includes("verification") ||
    value.includes("manual")
  ) {
    return "is-review";
  }

  return "is-default";
};


const getConditionClass = (condition) => {
  const value = normalizeKey(condition);

  if (
    value.includes("good") ||
    value.includes("excellent")
  ) {
    return "is-good";
  }

  if (
    value.includes("fair") ||
    value.includes("moderate") ||
    value.includes("average")
  ) {
    return "is-fair";
  }

  if (
    value.includes("damaged") ||
    value.includes("poor")
  ) {
    return "is-damaged";
  }

  if (
    value.includes("severe") ||
    value.includes("critical")
  ) {
    return "is-severe";
  }

  return "is-unknown";
};


const normalizeRecommendation = (
  item,
  index,
) => {
  const decisionAnalysis =
    item?.decision_analysis || {};

  const decision =
    decisionAnalysis?.decision ||
    item?.decision ||
    {};

  const sustainability =
    item?.sustainability_analysis ||
    item?.sustainability ||
    {};

  const materialData =
    decisionAnalysis?.material_data ||
    item?.material_data ||
    {};

  const conditionAnalysis =
    item?.condition_analysis || {};

  const stored =
    item?.stored_assessment || {};

  const recommendation = firstValue(
    decision?.final_decision,
    decision?.recommendation,
    stored?.final_decision,
    item?.final_decision,
    item?.recommendation,
    item?.recommended_action,
    "Manual Review",
  );

  const fabricClass = firstValue(
    item?.fabric_prediction?.fabric_name,
    item?.fabric_prediction?.class_name,
    item?.fabric_name,
    item?.fabric_category,
    "",
  );

  const material = firstValue(
    item?.material_verification?.material,
    sustainability?.material,
    stored?.material,
    item?.material,
    item?.material_name,
    fabricClass,
    "Unknown",
  );

  const description = firstValue(
    decision?.explanation,
    decision?.reason,
    decision?.description,
    item?.description,
    item?.reason,
    `${titleCase(
      recommendation,
    )} is recommended based on the detected textile material, condition and recovery potential.`,
  );

  const requiresManualReview =
    Boolean(
      firstValue(
        sustainability
          ?.requires_manual_review,
        decision?.requires_manual_review,
        stored?.requires_manual_review,
        item?.requires_manual_review,
        false,
      ),
    ) ||
    normalizeKey(recommendation).includes(
      "manual",
    ) ||
    normalizeKey(recommendation).includes(
      "verification",
    );

  const sustainabilityScore =
    toNullableNumber(
      firstValue(
        sustainability
          ?.sustainability_score,
        stored?.sustainability_score,
        item?.sustainability_score,
      ),
    );

  return {
    id: firstValue(
      item?.upload_id,
      item?.recommendation_id,
      item?.id,
      index + 1,
    ),

    material: titleCase(material),

    fabricClass: titleCase(
      fabricClass || "Not available",
    ),

    recommendation: titleCase(
      recommendation,
    ),

    recoveryCategory: titleCase(
      firstValue(
        decision?.recovery_category,
        stored?.recovery_category,
        item?.recovery_category,
        "Circular Recovery",
      ),
    ),

    condition: titleCase(
      firstValue(
        conditionAnalysis?.condition,
        item?.condition,
        "Not assessed",
      ),
    ),

    contamination: titleCase(
      firstValue(
        conditionAnalysis?.contamination,
        conditionAnalysis
          ?.contamination_level,
        item?.contamination,
        item?.contamination_level,
        "Not assessed",
      ),
    ),

    description,

    sustainabilityScore,

    circularityLevel: titleCase(
      firstValue(
        sustainability
          ?.circularity_level,
        stored?.circularity_level,
        item?.circularity_level,
        "Not assessed",
      ),
    ),

    co2Saved:
      toNullableNumber(
        firstValue(
          sustainability?.co2_saved_kg,
          sustainability
            ?.estimated_co2_saved_kg,
          stored?.co2_saved_kg,
          item?.co2_saved_kg,
        ),
      ) ?? 0,

    waterSaved:
      toNullableNumber(
        firstValue(
          sustainability
            ?.water_saved_liters,
          sustainability
            ?.estimated_water_saved_liters,
          stored?.water_saved_liters,
          item?.water_saved_liters,
        ),
      ) ?? 0,

    energySaved:
      toNullableNumber(
        firstValue(
          sustainability
            ?.energy_saved_kwh,
          sustainability
            ?.estimated_energy_saved_kwh,
          stored?.energy_saved_kwh,
          item?.energy_saved_kwh,
        ),
      ) ?? 0,

    landfillDiverted:
      toNullableNumber(
        firstValue(
          sustainability
            ?.landfill_diverted_kg,
          sustainability
            ?.estimated_landfill_diverted_kg,
          stored?.landfill_diverted_kg,
          item?.landfill_diverted_kg,
        ),
      ) ?? 0,

    environmentalImpact: titleCase(
      firstValue(
        sustainability
          ?.environmental_impact,
        stored
          ?.environmental_impact,
        item?.environmental_impact,
        materialData
          ?.environmental_impact,
        "Not available",
      ),
    ),

    ruleUsed: firstValue(
      decision?.rule_id,
      decision?.rule_name,
      decision?.decision_rule,
      item?.decision_rule,
      item?.rule_id,
      item?.rule_name,
      "Not available",
    ),

    assessmentStatus: titleCase(
      firstValue(
        sustainability
          ?.assessment_status,
        stored?.assessment_status,
        item?.assessment_status,
        requiresManualReview
          ? "Manual Review"
          : "Completed",
      ),
    ),

    manualReview: requiresManualReview,
  };
};


function Recommendations() {
  const [
    recommendationResponse,
    setRecommendationResponse,
  ] = useState([]);

  const [
    datasetAnalytics,
    setDatasetAnalytics,
  ] = useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    recommendationFilter,
    setRecommendationFilter,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [sortBy, setSortBy] =
    useState("latest");

  const [page, setPage] =
    useState(1);

  const [
    selectedRecommendation,
    setSelectedRecommendation,
  ] = useState(null);

  const rowsPerPage = 10;


  useEffect(() => {
    let active = true;

    const loadRecommendations = async () => {
      setLoading(true);
      setError("");

      const [
        recommendationResult,
        datasetResult,
      ] = await Promise.allSettled([
        getRecommendations(),
        getDatasetAnalytics(),
      ]);

      if (!active) {
        return;
      }

      if (
        recommendationResult.status ===
        "fulfilled"
      ) {
        setRecommendationResponse(
          recommendationResult.value,
        );
      } else {
        setRecommendationResponse([]);
      }

      if (
        datasetResult.status ===
        "fulfilled"
      ) {
        setDatasetAnalytics(
          datasetResult.value || {},
        );
      } else {
        setDatasetAnalytics({});
      }

      if (
        recommendationResult.status ===
          "rejected" &&
        datasetResult.status ===
          "rejected"
      ) {
        setError(
          "Recommendation intelligence could not be loaded. Confirm that the backend is running.",
        );
      } else if (
        recommendationResult.status ===
        "rejected"
      ) {
        setError(
          "Dataset intelligence loaded, but live recommendations are unavailable.",
        );
      } else if (
        datasetResult.status ===
        "rejected"
      ) {
        setError(
          "Live recommendations loaded, but dataset insights are unavailable.",
        );
      }

      setLoading(false);
    };

    loadRecommendations();

    return () => {
      active = false;
    };
  }, []);


  useEffect(() => {
    document.body.style.overflow =
      selectedRecommendation
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedRecommendation]);


  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedRecommendation(null);
      }
    };

    window.addEventListener(
      "keydown",
      closeOnEscape,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        closeOnEscape,
      );
    };
  }, []);


  const recommendations = useMemo(
    () =>
      normalizeList(
        recommendationResponse,
      ).map(normalizeRecommendation),
    [recommendationResponse],
  );


  const datasetPathways = useMemo(() => {
  const source =
    datasetAnalytics
      ?.recommendation_distribution ||
    [];

  const groupedPathways = {};

  source.forEach((item) => {
    const recommendation = titleCase(
      firstValue(
        item?.recommendation,
        item?.final_decision,
        item?.pathway,
        "Unknown Pathway",
      ),
    );

    const key =
      normalizeKey(recommendation);

    const recordCount =
      toNullableNumber(
        firstValue(
          item?.record_count,
          item?.count,
        ),
      ) ?? 0;

    const averageScore =
      toNullableNumber(
        firstValue(
          item
            ?.average_sustainability_score,
          item?.average_score,
        ),
      ) ?? 0;

    if (!groupedPathways[key]) {
      groupedPathways[key] = {
        recommendation,
        recordCount: 0,
        weightedScoreTotal: 0,
      };
    }

    groupedPathways[key].recordCount +=
      recordCount;

    groupedPathways[
      key
    ].weightedScoreTotal +=
      averageScore * recordCount;
  });

  return Object.values(
    groupedPathways,
  )
    .map((pathway) => ({
      recommendation:
        pathway.recommendation,

      recordCount:
        pathway.recordCount,

      averageScore:
        pathway.recordCount > 0
          ? pathway.weightedScoreTotal /
            pathway.recordCount
          : 0,
    }))
    .sort(
      (first, second) =>
        second.recordCount -
        first.recordCount,
    );
}, [
  datasetAnalytics
    ?.recommendation_distribution,
]);


  const pathwayMap = useMemo(() => {
    const result = {};

    datasetPathways.forEach((pathway) => {
      result[
        normalizeKey(
          pathway.recommendation,
        )
      ] = pathway;
    });

    return result;
  }, [datasetPathways]);


  const enhancedRecommendations =
    useMemo(
      () =>
        recommendations.map((item) => {
          const pathway =
            pathwayMap[
              normalizeKey(
                item.recommendation,
              )
            ];

          const displayedScore =
            item.sustainabilityScore ??
            pathway?.averageScore ??
            0;

          return {
            ...item,

            pathwayRecords:
              pathway?.recordCount || 0,

            pathwayAverageScore:
              pathway?.averageScore || 0,

            displayedScore:
              Number.isFinite(
                Number(displayedScore),
              )
                ? Number(displayedScore)
                : 0,
          };
        }),
      [
        recommendations,
        pathwayMap,
      ],
    );


  const uniqueRecommendations =
    useMemo(
      () =>
        [
          ...new Set(
            enhancedRecommendations.map(
              (item) =>
                item.recommendation,
            ),
          ),
        ].sort(),
      [enhancedRecommendations],
    );


  const filteredRecommendations =
    useMemo(() => {
      const normalizedSearch =
        normalizeKey(search);

      const filtered =
        enhancedRecommendations.filter(
          (item) => {
            const matchesSearch =
              !normalizedSearch ||
              normalizeKey(
                item.material,
              ).includes(
                normalizedSearch,
              ) ||
              normalizeKey(
                item.recommendation,
              ).includes(
                normalizedSearch,
              ) ||
              normalizeKey(
                item.condition,
              ).includes(
                normalizedSearch,
              ) ||
              String(item.id).includes(
                normalizedSearch,
              );

            const matchesRecommendation =
              recommendationFilter ===
                "all" ||
              item.recommendation ===
                recommendationFilter;

            const matchesStatus =
              statusFilter === "all" ||
              (statusFilter ===
                "completed" &&
                !item.manualReview) ||
              (statusFilter ===
                "review" &&
                item.manualReview);

            return (
              matchesSearch &&
              matchesRecommendation &&
              matchesStatus
            );
          },
        );

      return [...filtered].sort(
        (first, second) => {
          if (sortBy === "score-high") {
            return (
              second.displayedScore -
              first.displayedScore
            );
          }

          if (sortBy === "score-low") {
            return (
              first.displayedScore -
              second.displayedScore
            );
          }

          if (sortBy === "oldest") {
            return (
              Number(first.id) -
              Number(second.id)
            );
          }

          return (
            Number(second.id) -
            Number(first.id)
          );
        },
      );
    }, [
      enhancedRecommendations,
      search,
      recommendationFilter,
      statusFilter,
      sortBy,
    ]);


  useEffect(() => {
    setPage(1);
  }, [
    search,
    recommendationFilter,
    statusFilter,
    sortBy,
  ]);


  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRecommendations.length /
        rowsPerPage,
    ),
  );


  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);


  const currentRows =
    filteredRecommendations.slice(
      (page - 1) * rowsPerPage,
      page * rowsPerPage,
    );


  const completedRecommendations =
    enhancedRecommendations.filter(
      (item) => !item.manualReview,
    ).length;


  const reviewRecommendations =
    enhancedRecommendations.filter(
      (item) => item.manualReview,
    ).length;


  /*
    Only records that genuinely contain a stored
    sustainability score are included.

    Missing scores are no longer converted to zero.
  */
  const validLiveScores = useMemo(
    () =>
      enhancedRecommendations
        .map(
          (item) =>
            item.sustainabilityScore,
        )
        .filter(
          (score) =>
            score !== null &&
            Number.isFinite(score),
        ),
    [enhancedRecommendations],
  );


  const averageLiveScore = useMemo(() => {
    if (validLiveScores.length) {
      const total =
        validLiveScores.reduce(
          (sum, score) =>
            sum + score,
          0,
        );

      return (
        total /
        validLiveScores.length
      );
    }

    return (
      toNullableNumber(
        datasetAnalytics?.summary
          ?.average_sustainability_score,
      ) ?? 0
    );
  }, [
    validLiveScores,
    datasetAnalytics,
  ]);


  const exportCsv = () => {
    if (!filteredRecommendations.length) {
      return;
    }

    const headers = [
      "Record ID",
      "Material",
      "Fabric Class",
      "Recommendation",
      "Condition",
      "Contamination",
      "Circularity",
      "Sustainability Score",
      "Status",
      "CO2 Saved (kg)",
      "Water Saved (L)",
      "Energy Saved (kWh)",
      "Landfill Diverted (kg)",
      "Rule Used",
    ];

    const escapeCsv = (value) =>
      `"${String(value ?? "")
        .replaceAll('"', '""')}"`;

    const rows =
      filteredRecommendations.map(
        (item) =>
          [
            `REC-${String(
              item.id,
            ).padStart(3, "0")}`,
            item.material,
            item.fabricClass,
            item.recommendation,
            item.condition,
            item.contamination,
            item.circularityLevel,
            item.displayedScore.toFixed(1),
            item.manualReview
              ? "Manual Review"
              : "Completed",
            item.co2Saved,
            item.waterSaved,
            item.energySaved,
            item.landfillDiverted,
            item.ruleUsed,
          ]
            .map(escapeCsv)
            .join(","),
      );

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows,
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type:
          "text/csv;charset=utf-8;",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "textile-recommendations.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };


  if (loading) {
    return (
      <main className="recommendations-page recommendations-loading">
        <div className="recommendations-loader" />

        <h2>
          Loading recommendations
        </h2>

        <p>
          Preparing circular recovery intelligence.
        </p>
      </main>
    );
  }


  return (
    <main className="recommendations-page">
      <section className="recommendations-hero">
        <div>
          <span className="recommendations-eyebrow">
            AI circular decision engine
          </span>

          <h1>
            Practical textile recovery decisions.
          </h1>

          <p>
            Search, filter and inspect
            AI-generated recovery pathways
            from uploaded textile
            assessments.
          </p>
        </div>

        <div className="recommendations-hero-icon">
          <FaRecycle size={32} />
        </div>
      </section>


      {error && (
        <div className="recommendations-alert">
          <FaExclamationTriangle
            size={18}
          />

          <p>{error}</p>
        </div>
      )}


      <section className="recommendations-summary">
        <article className="recommendation-summary-card recommendation-summary-primary">
          <div>
            <span>01</span>
            <FaRecycle size={20} />
          </div>

          <strong>
            {formatNumber(
              enhancedRecommendations.length,
              0,
            )}
          </strong>

          <h2>
            Total recommendations
          </h2>

          <p>
            All generated recovery
            decisions
          </p>
        </article>


        <article className="recommendation-summary-card">
          <div>
            <span>02</span>
            <FaCheckCircle size={20} />
          </div>

          <strong>
            {formatNumber(
              completedRecommendations,
              0,
            )}
          </strong>

          <h2>Completed</h2>

          <p>
            Resolved recovery decisions
          </p>
        </article>


        <article className="recommendation-summary-card">
          <div>
            <span>03</span>
            <FaLeaf size={20} />
          </div>

          <strong>
            {averageLiveScore.toFixed(1)}
          </strong>

          <h2>Average score</h2>

          <p>
            Sustainability performance
          </p>
        </article>


        <article className="recommendation-summary-card">
          <div>
            <span>04</span>

            <FaExclamationTriangle
              size={20}
            />
          </div>

          <strong>
            {formatNumber(
              reviewRecommendations,
              0,
            )}
          </strong>

          <h2>Manual review</h2>

          <p>
            Records needing inspection
          </p>
        </article>
      </section>


      <section className="recommendations-table-card">
        <div className="recommendations-table-header">
          <div>
            <span>
              Live textile intelligence
            </span>

            <h2>
              Recovery recommendations
            </h2>
          </div>

          <div className="recommendations-header-actions">
            <p>
              {
                filteredRecommendations.length
              }{" "}
              records
            </p>

            <button
              type="button"
              className="recommendations-export-button"
              onClick={exportCsv}
              disabled={
                !filteredRecommendations.length
              }
            >
              <FaDownload size={13} />
              Export CSV
            </button>
          </div>
        </div>


        <div className="recommendations-toolbar">
          <div className="recommendations-search">
            <FaSearch size={15} />

            <input
              type="text"
              placeholder="Search by ID, material or recommendation..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </div>


          <div className="recommendations-filter">
            <FaFilter size={14} />

            <select
              value={
                recommendationFilter
              }
              onChange={(event) =>
                setRecommendationFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                All pathways
              </option>

              {uniqueRecommendations.map(
                (recommendation) => (
                  <option
                    key={recommendation}
                    value={recommendation}
                  >
                    {recommendation}
                  </option>
                ),
              )}
            </select>
          </div>


          <select
            className="recommendations-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
          >
            <option value="all">
              All statuses
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="review">
              Manual review
            </option>
          </select>


          <select
            className="recommendations-select"
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value,
              )
            }
          >
            <option value="latest">
              Latest first
            </option>

            <option value="oldest">
              Oldest first
            </option>

            <option value="score-high">
              Highest score
            </option>

            <option value="score-low">
              Lowest score
            </option>
          </select>
        </div>


        <div className="recommendations-table-wrap">
          <table className="recommendations-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Material</th>
                <th>Recommendation</th>
                <th>Condition</th>
                <th>Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length ? (
                currentRows.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="recommendations-data-row"
                      onClick={() =>
                        setSelectedRecommendation(
                          item,
                        )
                      }
                    >
                      <td>
                        <strong className="recommendation-record-id">
                          REC-
                          {String(
                            item.id,
                          ).padStart(
                            3,
                            "0",
                          )}
                        </strong>
                      </td>

                      <td>
                        <div className="table-material-cell">
                          <strong>
                            {item.material}
                          </strong>

                          <span>
                            {
                              item.fabricClass
                            }
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`recommendation-pathway-badge ${getRecommendationClass(
                            item.recommendation,
                          )}`}
                        >
                          {
                            item.recommendation
                          }
                        </span>
                      </td>

                      <td>
                        <span
                          className={`recommendation-condition-badge ${getConditionClass(
                            item.condition,
                          )}`}
                        >
                          {item.condition}
                        </span>
                      </td>

                      <td>
                        <div className="table-score-cell">
                          <strong>
                            {item.displayedScore.toFixed(
                              1,
                            )}
                          </strong>

                          <div>
                            <span
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    item.displayedScore,
                                  ),
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`recommendation-status ${
                            item.manualReview
                              ? "is-review"
                              : "is-complete"
                          }`}
                        >
                          {item.manualReview
                            ? "Manual Review"
                            : "Completed"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="recommendation-view-button"
                          onClick={(
                            event,
                          ) => {
                            event.stopPropagation();

                            setSelectedRecommendation(
                              item,
                            );
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="recommendations-no-results"
                  >
                    No recommendations
                    match the selected
                    filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


        <div className="recommendations-pagination">
          <p>
            Showing{" "}
            {filteredRecommendations.length
              ? (page - 1) *
                  rowsPerPage +
                1
              : 0}
            –
            {Math.min(
              page * rowsPerPage,
              filteredRecommendations.length,
            )}{" "}
            of{" "}
            {
              filteredRecommendations.length
            }
          </p>

          <div>
            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(
                    1,
                    current - 1,
                  ),
                )
              }
            >
              <FaChevronLeft />
            </button>

            <span>
              Page {page} of{" "}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={
                page === totalPages
              }
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    totalPages,
                    current + 1,
                  ),
                )
              }
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </section>


      <section className="recommendations-pathway-section">
        <div className="recommendations-table-header">
          <div>
            <span>
              Dataset intelligence
            </span>

            <h2>
              Leading recovery pathways
            </h2>
          </div>
        </div>

        <div className="dataset-pathway-table-wrap">
          <table className="dataset-pathway-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Pathway</th>
                <th>
                  Dataset records
                </th>
                <th>
                  Average score
                </th>
                <th>Distribution</th>
              </tr>
            </thead>

            <tbody>
              {datasetPathways
                .slice(0, 8)
                .map(
                  (
                    pathway,
                    index,
                  ) => {
                    const maximumRecords =
                      datasetPathways[0]
                        ?.recordCount || 1;

                    const width =
                      Math.min(
                        100,
                        (pathway.recordCount /
                          maximumRecords) *
                          100,
                      );

                    return (
                      <tr
                        key={
                          pathway.recommendation
                        }
                      >
                        <td>
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </td>

                        <td>
                          <span
                            className={`recommendation-pathway-badge ${getRecommendationClass(
                              pathway.recommendation,
                            )}`}
                          >
                            {
                              pathway.recommendation
                            }
                          </span>
                        </td>

                        <td>
                          {formatNumber(
                            pathway.recordCount,
                            0,
                          )}
                        </td>

                        <td>
                          <strong>
                            {pathway.averageScore.toFixed(
                              1,
                            )}
                          </strong>
                        </td>

                        <td>
                          <div className="dataset-distribution-bar">
                            <span
                              style={{
                                width: `${width}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
            </tbody>
          </table>
        </div>
      </section>


      <RecommendationDrawer
        recommendation={
          selectedRecommendation
        }
        onClose={() =>
          setSelectedRecommendation(null)
        }
      />
    </main>
  );
}


export default Recommendations;