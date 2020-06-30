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
    { title: (<span className='classificationText'><br /><span>Geographic Severity</span></span>) },
    { title: (<span className='classificationText'><br /><span>Opacity Extent</span></span>) },
    { title: (<span></span>) }
  ]

  const rows = analysisList.map((analysis: ISeries) => ({
    cells: [
      {
        title: (<div><b>{analysis.imageName.split('/').pop()}</b></div>)
      },
      {
        title: (<PredictionCircle covidCircle={true} predictionNumber={analysis.predCovid} />)
      }, {
        title: (<PredictionCircle covidCircle={false} predictionNumber={analysis.predPneumonia} />)
      }, {
        title: (<PredictionCircle covidCircle={false} predictionNumber={analysis.predNormal} />)
      }, {
        title: `${analysis.geographic ? `${analysis.geographic.severity}`: 'N/A'}`
      }, {
        title: `${analysis.opacity ? `${analysis.opacity.extentScore}`: 'N/A'}`
      }, {
        title: (<Button variant="secondary" onClick={()=>viewImage(analysis)}>View</Button>)
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