import { Button, Stack, StackItem, Divider } from '@patternfly/react-core';
import React, { useContext } from "react";
import ChrisIntegration, { LocalFile } from '../../services/chris_integration';
import { AppContext } from '../../context/context';
import { AnalysisTypes } from '../../context/actions/types';
import PatientLookup from '../PatientLookup';

const CreateAnalysis: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { prevAnalyses } = state;
  const { page, perpage } = prevAnalyses;

  const openLocalFilePicker = (): Promise<LocalFile[]> => {

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.click();
    return new Promise(res => {
      input.onchange = async () => {
        if (input.files) {
          const files = Array.from(input.files).map(file => {
            return {
              name: file.name,
              blob: file
            };
          });
          res(files); // resolve
        }
      };
    });
  }

  const submitFile = () => {
    openLocalFilePicker().then(async (files: LocalFile[]) => {
      const res: boolean = await ChrisIntegration.processNewAnalysis(files)
      if (res) {
        const analysisList = await ChrisIntegration.getPastAnalaysis(page, perpage)
        dispatch({
          type: AnalysisTypes.Update_list,
          payload: { list: analysisList }
        })
        const total = await ChrisIntegration.getTotalAnalyses()
        dispatch({
          type: AnalysisTypes.Update_total,
          payload: { total: total }
        })
      }
    })
  }

  return (
    <Stack>
      <StackItem>Create a new predicative analysis</StackItem>
      <StackItem isFilled>
        <PatientLookup isOnDashboard={true}></PatientLookup>
        <Button onClick={submitFile}>Choose File...</Button>
      </StackItem>
    </Stack>
  );
}

export { CreateAnalysis as CreateAnalysisSection };

