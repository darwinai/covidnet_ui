import {
  Button, Stack, StackItem, TextInput
} from "@patternfly/react-core";
import React, { useContext, useState } from "react";
import { CreateAnalysisTypes, DicomImagesTypes } from "../context/actions/types";
import { AppContext } from "../context/context";
import chris_integration from "../services/chris_integration";
import pacs_integration from "../services/pacs_integration";
import CreateAnalysisService, { StudyInstance } from "../services/CreateAnalysisService";
interface PatientLookupProps {
  setHasSearched: (newValue: boolean) => void,
  setIsSearching: (newValue: boolean) => void
}

const PatientLookup: React.FC<PatientLookupProps> = ({ setHasSearched, setIsSearching }) => {
  const { state: { createAnalysis: { patientID } }, dispatch } = useContext(AppContext);

  const [patientIDInput, setPatientIDInput] = useState<string>(patientID ? patientID : "");

  const newLookup = async (event?: React.FormEvent) => {
    event?.preventDefault();

    dispatch({
      type: CreateAnalysisTypes.Update_patient_ID,
      payload: {
        patientID: patientIDInput
      }
    });

    setIsSearching(true);

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
    
    setIsSearching(false);
    setHasSearched(true);
  }

  const submitButton = (
    <Button variant="secondary" type="submit" isDisabled={patientIDInput.replace(/^\s*/, "") === ""}>
      <b>Search</b>
    </Button>
  );

  return (
    <React.Fragment>
      <Stack>
        <StackItem className="input-row-label">Patient Lookup</StackItem>
        <StackItem className="InputRow">
        <form onSubmit={newLookup} className="form-display">
          <div className="InputRowField">
            <label>Patient MRN</label>
            <TextInput value={patientIDInput} type="text" onChange={setPatientIDInput} aria-label="MRN Search Field" />
          </div>
          <div className="InputRowField">
            {submitButton}
          </div>
        </form>
        </StackItem>
      </Stack>
    </React.Fragment>
  )
}

export default PatientLookup
