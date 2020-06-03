import React, { useState } from "react";
import { Pagination } from "@patternfly/react-core";
import {
  Table,
  TableHeader,
  TableBody,
  textCenter,
} from '@patternfly/react-table';

const PastAnalysis = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(1);

  const columns = [
    {
      title: (<span>Image<br/><span className='classificationText'>&nbsp;</span></span>),
    },
    {
      title: (<span>Patient MRN<br/><span className='classificationText'>&nbsp;</span></span>),
    },
    {
      title: (<span>Created<br/><span className='classificationText'>&nbsp;</span></span>),
    },
    {
      title: (<span>Study<br/><span className='classificationText'>&nbsp;</span></span>),
    },
    {
      title: (<span>Predictions<br/><span className='classificationText'>COVID-19</span></span>),
    },
    {
      title: (<span><br/><span className='classificationText'>Pneumonia</span></span>),
    },
    {
      title: (<span><br/><span className='classificationText'>Normal</span></span>),
    }
  ]
  const rows = [
    {
      cells: [{
        title: <div>one </div>,
        props: { title: 'hover title'}
      }, 'two', 'three', 'four', 'five','x','y']
    }
  ]

  return (
    <React.Fragment>
      <h2>Past predicative analyses</h2>
      <Pagination
        itemCount={50}
        perPage={perPage}
        page={page}
        onSetPage={(_event, pageNumber) => setPage(pageNumber)}
        widgetId="pagination-options-menu-top"
        onPerPageSelect={(_event, perPage) => setPerPage(perPage)}
      />
      <Table aria-label="Simple Table" cells={columns} rows={rows}>
        <TableHeader />
        <TableBody />
      </Table>
    </React.Fragment>
  )
}

export default PastAnalysis