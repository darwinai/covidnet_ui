import { Button } from '@patternfly/react-core';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AnalysisTypes } from '../../context/actions/types';
import { AppContext } from '../../context/context';
import { ISeries, StudyInstanceWithSeries } from '../../context/reducers/analyseReducer';
import PredictionCircle from '../PredictionCircle';

interface SeriesTableProps {
  studyInstance: StudyInstanceWithSeries
}

export const isLargestNumber = (num: number | null | undefined, numArray: number[]) => {
  if (num && numArray) {
    return num === Math.max(...numArray);
  }
  else {
    return false;
  }
}

const SeriesTable: React.FC<SeriesTableProps> = ({ studyInstance }) => {
  const history = useHistory();
  const { dispatch } = useContext(AppContext);
  const { series: analysisList } = studyInstance;
  let titles = [{ title: (<span><br />Image<span className='classificationText'>&nbsp;</span></span>) }];

  for (let title of analysisList[0]?.columnNames) { // Adding the column titles for each analysis
    titles.push({ title: (<span><br /><span className='classificationText'>{title}</span></span>) });
  }

  titles.push({ title: (<span className='classificationText'><span>Geographic<br />Severity</span></span>) },
              { title: (<span className='classificationText'><span>Opacity<br />Extent</span></span>) },
              { title: (<span></span>) });

  const columns = titles;

  const rows = analysisList.map((analysis: ISeries, index: number) => {
    let analysisCells: any = [{ title: (<div><b>{analysis.imageName.split('/').pop()}</b></div>) }]

    for (let classification in analysis.columnNames) { // Dynamically displaying each prediction class
      analysisCells.push({
        title: (<PredictionCircle key={analysis?.columnNames[classification]}
          largeCircle={isLargestNumber(analysis?.columnValues[classification], analysis?.columnValues)}
          predictionNumber={analysis?.columnValues[classification]} />)
      });
    }
    
      analysisCells.push({
        title: `${analysis.geographic ? `${analysis.geographic.severity}` : 'N/A'}`
      }, {
        title: `${analysis.opacity ? `${analysis.opacity.extentScore}` : 'N/A'}`
      }, {
        title: (<Button variant="secondary" onClick={() => viewImage(index)}>View</Button>)
      });

    return { cells: analysisCells };
  })


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
      <TableBody className="anaylsisTableRow" />
    </Table>
  )
}

export default SeriesTable;