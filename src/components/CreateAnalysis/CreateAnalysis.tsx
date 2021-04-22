import React from "react";
import PatientLookup from '../PatientLookup';

const CreateAnalysis: React.FC = () => {
  return <PatientLookup isOnDashboard={true}></PatientLookup>;
}

export { CreateAnalysis as CreateAnalysisSection };
