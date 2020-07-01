import { Button } from '@patternfly/react-core';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useContext } from 'react';
import { ISeries } from '../../context/reducers/analyseReducer';
import PredictionCircle from '../PredictionCircle';
import { AppContext } from '../../context/context';
import { AnalysisTypes } from '../../context/actions/types';
import { useHistory } from 'react-router-dom';

interface SeriesTableProps {
  analysisList: ISeries[]
}

const SeriesTable: React.FC<SeriesTableProps> = ({ analysisList }) => {
  const history = useHistory();
  const { dispatch } = useContext(AppContext);
  const columns = [
    { title: (<span><br />Image<span className='classificationText'>&nbsp;</span></span>) },
    { title: (<span>Predictions<br /><span className='classificationText'>COVID-19</span></span>) },
    { title: (<span><br /><span className='classificationText'>Pneumonia</span></span>) },
    { title: (<span><br /><span className='classificationText'>Normal</span></span>) },
    { title: (<span className='classificationText'><span>Geographic<br/>Severity</span></span>) },
    { title: (<span className='classificationText'><span>Opacity<br/>Extent</span></span>) },
    { title: (<span></span>) }
  ]

  const isLargestNumber = (num: number, compare1: number, compare2: number) => {
    return num > compare1 && num > compare2;
  }

  const rows = analysisList.map((analysis: ISeries) => ({
    cells: [
      {
        title: (<div><b>{analysis.imageName.split('/').pop()}</b></div>)
      },
      {
        title: (<PredictionCircle
          largeCircle={isLargestNumber(analysis.predCovid, analysis.predNormal, analysis.predPneumonia)}
          predictionNumber={analysis.predCovid} />)
      }, {
        title: (<PredictionCircle
          largeCircle={isLargestNumber(analysis.predPneumonia, analysis.predNormal, analysis.predCovid)}
          predictionNumber={analysis.predPneumonia} />)
      }, {
        title: (<PredictionCircle
          largeCircle={isLargestNumber(analysis.predNormal, analysis.predPneumonia, analysis.predCovid)}
          predictionNumber={analysis.predNormal} />)
      }, {
        title: `${analysis.geographic ? `${analysis.geographic.severity}` : 'N/A'}`
      }, {
        title: `${analysis.opacity ? `${analysis.opacity.extentScore}` : 'N/A'}`
      }, {
        title: (<Button variant="secondary" onClick={() => viewImage(analysis)}>View</Button>)
      }
    ]
  }))

  const viewImage = (analysis: ISeries) => {
    dispatch({
      type: AnalysisTypes.Update_selected_image,
      payload: { selectedImage: analysis }
    })
    history.push('/viewImage')
  }

  return (
    <Table aria-label="Simple Table" cells={columns} rows={rows}>
      <TableHeader />
      <TableBody className="anaylsisTableRow" />
    </Table>
  )
}

export default SeriesTable;