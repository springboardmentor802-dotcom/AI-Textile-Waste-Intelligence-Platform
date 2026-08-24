/* ---------------------------------------------------------
   SUSTAINABILITY DEMO DATA
   ---------------------------------------------------------
   These values are DEMONSTRATION values only. There are no
   backend endpoints yet for circularity score, waste
   diversion %, carbon reduction, resource recovery, or their
   historical trends (see the same note already present in
   Dashboard.jsx for the sustainability_manager KPIs).

   This file is the single place holding those placeholder
   numbers so that swapping them for real API data later means
   changing this file only — no page component should need to
   change. Once endpoints exist, replace the static exports
   below with data fetched from the API (e.g. inside a
   useEffect + useState in each page, the same pattern already
   used in Dashboard.jsx for inventory/prediction stats).
---------------------------------------------------------- */

export const SUSTAINABILITY_OVERVIEW_DATA = {
  kpis: [
    {
      key: 'circularity',
      label: 'Circularity Score',
      value: 81.55,
      unit: '/100',
      sublabel: 'Overall circularity performance',
      color: 'teal',
    },
    {
      key: 'wasteDiversion',
      label: 'Waste Diversion',
      value: 78.4,
      unit: '%',
      sublabel: 'Waste diverted from landfill',
      color: 'magenta',
    },
    {
      key: 'carbonReduction',
      label: 'Carbon Reduction',
      value: 2.8,
      unit: ' t',
      sublabel: 'CO\u2082 emissions avoided',
      color: 'golden',
    },
    {
      key: 'resourceRecovery',
      label: 'Resource Recovery',
      value: 64.2,
      unit: '%',
      sublabel: 'Materials successfully recovered',
      color: 'lavender',
    },
  ],
  // Demo trend data — replace with real time-series once a
  // backend endpoint exists (e.g. GET /sustainability/trend).
  trend: [
    { label: 'Mar', value: 58 },
    { label: 'Apr', value: 63 },
    { label: 'May', value: 61 },
    { label: 'Jun', value: 69 },
    { label: 'Jul', value: 74 },
    { label: 'Aug', value: 81.55 },
  ],
};

export const CARBON_REDUCTION_DATA = {
  kpi: {
    label: 'Carbon Reduction',
    value: 2.8,
    unit: ' t',
    sublabel: 'CO\u2082 emissions avoided',
    color: 'lavender',
  },
  // Demo monthly trend — replace with real data once a backend
  // endpoint exists (e.g. GET /sustainability/carbon-reduction/trend).
  trend: [
    { label: 'Mar', value: 1.1 },
    { label: 'Apr', value: 1.4 },
    { label: 'May', value: 1.7 },
    { label: 'Jun', value: 2.0 },
    { label: 'Jul', value: 2.4 },
    { label: 'Aug', value: 2.8 },
  ],
  impact: [
    {
      title: 'Recovered fibers replace virgin production',
      body: 'Every kilogram of textile waste recovered and reused avoids the energy, water, and raw-material demand of producing new fiber from scratch.',
    },
    {
      title: 'Shorter processing chains',
      body: 'Recycled materials typically skip several energy-intensive stages of virgin textile manufacturing, cutting associated CO\u2082 output.',
    },
    {
      title: 'Less landfill, less methane',
      body: 'Diverting textiles from landfill reduces the decomposition of organic fibers, which is a source of methane emissions.',
    },
  ],
};

export const WASTE_DIVERSION_DATA = {
  kpis: [
    {
      key: 'wasteDiversion',
      label: 'Waste Diversion',
      value: 78.4,
      unit: '%',
      sublabel: 'Waste diverted from landfill',
      color: 'golden',
    },
    {
      key: 'wasteProcessed',
      label: 'Waste Processed',
      value: 0.1,
      unit: ' kg',
      sublabel: 'Total textile waste processed',
      color: 'teal',
    },
    {
      key: 'landfillAvoided',
      label: 'Landfill Avoided',
      value: 62.3,
      unit: '%',
      sublabel: 'Share of processed waste kept from landfill',
      color: 'magenta',
    },
  ],
  // Demo trend — replace with real data once a backend endpoint
  // exists (e.g. GET /sustainability/waste-diversion/trend).
  trend: [
    { label: 'Mar', value: 52 },
    { label: 'Apr', value: 58 },
    { label: 'May', value: 63 },
    { label: 'Jun', value: 69 },
    { label: 'Jul', value: 74 },
    { label: 'Aug', value: 78.4 },
  ],
  flow: [
    { key: 'generated', label: 'Waste Generated' },
    { key: 'collected', label: 'Waste Collected' },
    { key: 'processed', label: 'Waste Processed' },
    { key: 'recovered', label: 'Recovered / Reused' },
    { key: 'avoided', label: 'Landfill Avoided' },
  ],
};