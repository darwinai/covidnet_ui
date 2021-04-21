import { Button, Spinner } from '@patternfly/react-core';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { AnalysisTypes } from '../../context/actions/types';
import { AppContext } from '../../context/context';
import { ISeries, TStudyInstance } from '../../context/reducers/analyseReducer';
import PredictionCircle from '../PredictionCircle';
import PreviewNotAvailable from '../../shared/PreviewNotAvailable';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { TAnalysisResults } from '../../services/chris_integration';
import { DcmImage } from "../../context/reducers/dicomImagesReducer";

interface SeriesTableProps {
  data: Promise<TAnalysisResults>;
  dcmImage: DcmImage;
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

const SeriesTable: React.FC<SeriesTableProps> = ({ data, dcmImage, isProcessing }) => {
  const history = useHistory();
  const { dispatch } = useContext(AppContext);
  const [values, setValues] = useState<{series: ISeries[], classifications: string[]}>({series: [], classifications: []});

  useEffect(() => {
    (async () => {
      const {series, classifications} = await data;
      setValues({series, classifications});
    })();

  }, [])
  

  let titles = [
    { title: (<span className='classificationText'><br />Preview</span>) },
    { title: (<span className='classificationText'><br />Image</span>) }
  ];

  if (values.classifications.length) {
    values.classifications.forEach((value: string) => {
      titles.push({ title: (<><br /><span className="classificationText">{value}</span></>) }); // Adding the column titles for each analysis
    });
  } else {
    titles.push({ title: (<><br /><span className="classificationText">{"Results"}</span></>) }); // Adding column for studies containing only failed analyses
  }

  titles.push({ title: (<span className='classificationText'><span>Geographic<br />Severity</span></span>) },
    { title: (<span className='classificationText'><span>Opacity<br />Extent</span></span>) },
    { title: (<></>) });

  const columns = titles;

  const rows = values.series.map((analysis: ISeries, index: number) => {
    const isAnalysisValid = !!analysis.classifications.size;
    let analysisCells: any = [
      { title: (analysis.imageUrl ? <div><img src={analysis.imageUrl} className="thumbnail" alt="Analysis Scan Thumbnail" /></div> : <div><PreviewNotAvailable /></div>) },
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
    } else if (values.classifications?.length) { // If this Series' analysis was unsuccessful, but the list of classes is known, display 'N/A' for each classification result
      analysisCells.push(...values.classifications.map(() => ({
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
          dcmImage,
          series: values.series[index]
        }
      }
    })
    history.push('/viewImage');
  }

  return (
    <>
    { 
      values.series.length ?
      (
          <Table aria-label="Simple Table" cells={columns} rows={rows}>
            <TableHeader />
            <TableBody className="series-table-row" />
          </Table>
      ):
      (
        <div className="results-spinner-container">
          <Spinner size="lg" />
        </div>
      )
    }
    </>
  )
}

export default SeriesTable;
