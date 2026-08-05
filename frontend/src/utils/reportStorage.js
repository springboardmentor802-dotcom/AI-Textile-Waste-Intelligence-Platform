export function saveReport(report) {

    const reports =
        JSON.parse(localStorage.getItem("reports")) || [];

    reports.unshift(report);

    localStorage.setItem(
        "reports",
        JSON.stringify(reports)
    );

}

export function getReports() {

    return (
        JSON.parse(localStorage.getItem("reports")) || []
    );

}

export function deleteReport(id) {

    const reports = getReports().filter(
        (r) => r.id !== id
    );

    localStorage.setItem(
        "reports",
        JSON.stringify(reports)
    );

}