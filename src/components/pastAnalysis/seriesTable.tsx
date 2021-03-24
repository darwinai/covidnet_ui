import { Button } from '@patternfly/react-core';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AnalysisTypes } from '../../context/actions/types';
import { AppContext } from '../../context/context';
import { ISeries, StudyInstanceWithSeries } from '../../context/reducers/analyseReducer';
import PredictionCircle from '../PredictionCircle';
import PreviewNotAvailable from '../../shared/PreviewNotAvailable';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

interface SeriesTableProps {
  studyInstance: StudyInstanceWithSeries;
  classifications: string[];
  isProcessing: boolean;
}

export const isLargestNumber = (num: number | null | undefined, numArray: Map<string, number>) => {
  if (num && numArray) {
    let maxValue: number = 0;
    numArray.forEach((value: number) => {
      maxValue = (!maxValue || maxValue < value) ? value : maxValue;
    })

    return num === maxValue;
  }
  else {
    return false;
  }
}

const SeriesTable: React.FC<SeriesTableProps> = ({ studyInstance, classifications, isProcessing }) => {
  const history = useHistory();
  const { dispatch } = useContext(AppContext);
  const { series: analysisList } = studyInstance;

  let titles = [
    { title: (<span><br />Preview<span className='classificationText'>&nbsp;</span></span>) },
    { title: (<span><br />Image<span className='classificationText'>&nbsp;</span></span>) }
  ];

  if (classifications.length) {
    classifications.forEach((value: string) => {
      titles.push({ title: (<span><br /><span className="classificationText">{value}</span></span>) }); // Adding the column titles for each analysis
    });
  } else {
    titles.push({ title: (<span><br /><span className="classificationText">{"Results"}</span></span>) }); // Adding column for studies containing only failed analyses
  }

  titles.push({ title: (<span className='classificationText'><span>Geographic<br />Severity</span></span>) },
    { title: (<span className='classificationText'><span>Opacity<br />Extent</span></span>) },
    { title: (<></>) });

  const columns = titles;

  const rows = analysisList.map((analysis: ISeries, index: number) => {
    const isAnalysisValid = !!analysis.classifications.size;
    let analysisCells: any = [
      { title: (analysis.imageUrl ? <div><b><img src={analysis.imageUrl} className="thumbnail" /></b></div> : <div><PreviewNotAvailable /></div>) },
      { title: (<div><b>{analysis.imageName.split('/').pop()}</b></div>) }
    ];

    if (isAnalysisValid) { // If this Series' analysis was successful, read in its analysis results
      analysis.classifications.forEach((value: number, key: string) => { // Dynamically displaying each prediction class
        analysisCells.push({
          title: (<PredictionCircle key={key}
            largeCircle={isLargestNumber(value, analysis.classifications)}
            predictionNumber={value} />)
        });
      });
    } else if (classifications?.length) { // If this Series' analysis was unsuccessful, but the list of classes is known, display 'N/A' for each classification result
      analysisCells.push(...classifications.map(() => ({
        title: ("N/A")
      })));
    } else { // If this Series' analysis was unsuccessful, and the list of classes is unknown
      analysisCells.push({
        title: ("Results not available")
      });
    }

    analysisCells.push({
      title: analysis?.geographic?.severity || 'N/A'
    }, {
      title: analysis?.opacity?.extentScore || 'N/A'
    }, {
      title: (<>{
        isAnalysisValid || isProcessing ?
          (<Button variant="secondary" onClick={() => viewImage(index)} isDisabled={isProcessing}>View</Button>) :
          (<><ExclamationCircleIcon color="var(--pf-global--danger-color--100)" /><span className="analysis-failed-text">Analysis failed</span></>)
      }</>)
    });

    return { cells: analysisCells };
  });


  const viewImage = (index: number) => {
    dispatch({
      type: AnalysisTypes.Update_selected_image,
      payload: {
        selectedImage: {
          studyInstance: studyInstance,
          index
        }
      }
    })
    history.push('/viewImage');
  }

  return (
    <Table aria-label="Simple Table" cells={columns} rows={rows}>
      <TableHeader />
      <TableBody className="series-table-row" />
    </Table>
  )
}

export default SeriesTable;
