import { Button,TextInput } from "@patternfly/react-core";
import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { CreateAnalysisTypes, DicomImagesTypes } from "../context/actions/types";
import { AppContext } from "../context/context";
import RightArrowButton from "../pages/CreateAnalysisPage/RightArrowButton";
import chris_integration from "../services/chris_integration";
import pacs_integration from "../services/pacs_integration";
import CreateAnalysisService, { StudyInstance } from "../services/CreateAnalysisService";
interface PatientLookupProps {
  isOnDashboard: boolean
}

const PatientLookup: React.FC<PatientLookupProps> = ({ isOnDashboard }) => {
  const { state: { createAnalysis: { patientID } } } = useContext(AppContext);

  const { dispatch } = useContext(AppContext);
  const [patientIDInput, setPatientIDInput] = useState<string>((patientID && !isOnDashboard) ? patientID : "");
  const history = useHistory();

  const newLookup = async (event?: React.FormEvent) => {
    event?.preventDefault();
    dispatch({
      type: CreateAnalysisTypes.Update_patient_ID,
      payload: {
        patientID: patientIDInput
      }
    });

    try {
      const dcmImages = process.env.REACT_APP_CHRIS_UI_DICOM_SOURCE === 'pacs' ?
        await pacs_integration.queryPatientFiles(patientIDInput) :
        await chris_integration.fetchPacFiles(patientIDInput);

      dispatch({
        type: DicomImagesTypes.Update_all_images,
        payload: {
          images: dcmImages
        }
      });

      // Select first study instance by default
      const studyInstances: StudyInstance[] = CreateAnalysisService.extractStudyInstances(dcmImages);
      if (studyInstances.length > 0) {
        dispatch({
          type: CreateAnalysisTypes.UpdateCurrSelectedStudyUID,
          payload: {
            studyUID: studyInstances[0].studyInstanceUID
          }
        });
      }
    } catch (err) {
      console.error(err);
    }

    if (isOnDashboard) {
      history.push("/createAnalysis");
    }
  }

  const submitButton = isOnDashboard ? (
    <RightArrowButton type="submit">Continue</RightArrowButton>
  ) : (
    <Button variant="secondary" type="submit">
      <b>New Lookup</b>
    </Button>
  );

  return (
    <React.Fragment>
      <div className="InputRow">
        <form onSubmit={newLookup} className="form-display">
          <div className="InputRowField">
            <label>Patient MRN</label>
            <TextInput value={patientIDInput} type="text" onChange={setPatientIDInput} aria-label="MRN Search Field" />
          </div>
          <div className="InputRowField">
            {submitButton}
          </div>
        </form>
      </div>
    </React.Fragment >
  )
}

export default PatientLookup
