import { Button } from '@patternfly/react-core';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AnalysisTypes } from '../../context/actions/types';
import { AppContext } from '../../context/context';
import { ISeries, StudyInstanceWithSeries } from '../../context/reducers/analyseReducer';
import PredictionCircle from '../PredictionCircle';
import PreviewNotAvailable from '../../shared/PreviewNotAvailable';
interface SeriesTableProps {
  studyInstance: StudyInstanceWithSeries;
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

const SeriesTable: React.FC<SeriesTableProps> = ({ studyInstance, isProcessing }) => {
  const history = useHistory();
  const { dispatch } = useContext(AppContext);
  const { series: analysisList } = studyInstance;
  let titles = [
    { title: (<span><br />Preview<span className='classificationText'>&nbsp;</span></span>) },
    { title: (<span><br />Image<span className='classificationText'>&nbsp;</span></span>) }
  ];

  analysisList[0]?.classifications.forEach((value: number, key: string) => {
    titles.push({ title: (<span><br /><span className='classificationText'>{key}</span></span>) }); // Adding the column titles for each analysis
  });

  titles.push({ title: (<span className='classificationText'><span>Geographic<br />Severity</span></span>) },
              { title: (<span className='classificationText'><span>Opacity<br />Extent</span></span>) },
              { title: (<span></span>) });

  const columns = titles;

  const rows = analysisList.map((analysis: ISeries, index: number) => {
    let analysisCells: any = [
      { title: (analysis.imageUrl ? <div><img src={analysis.imageUrl} className="thumbnail" alt="Analysis Scan"/></div> : <div><PreviewNotAvailable /></div>) },
      { title: (<div><b>{analysis.imageName.split('/').pop()}</b></div>) }
    ];

    analysis.classifications.forEach((value: number, key: string) => { // Dynamically displaying each prediction class
      analysisCells.push({
        title: (<PredictionCircle key={key}
          largeCircle={isLargestNumber(value, analysis.classifications)}
          predictionNumber={value} />)});
    });
  
      analysisCells.push({
        title: `${analysis.geographic ? `${analysis.geographic.severity}` : 'N/A'}`
      }, {
        title: `${analysis.opacity ? `${analysis.opacity.extentScore}` : 'N/A'}`
      }, {
        title: (<Button variant="secondary" onClick={() => viewImage(index)} isDisabled={isProcessing}>View</Button>)
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
