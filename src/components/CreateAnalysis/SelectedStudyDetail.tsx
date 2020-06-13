import React from "react";
import { Alert, Checkbox } from '@patternfly/react-core';

const SelectedStudyDetail = () => {
  return (
    <div className="detail-select">
      <div className="flex_row">
        <div className="half_width padding_2rem">
          <h1 className="study-title">Patient Study C <span className="outtline-box red-small">XRAY</span></h1>
          <p className="color_grey s-large">Accession#09348250291931829</p>
          <div className="padding_bot_1rem"></div>
          <div className="flex_row">
            <div className="half_width">
              <h2 className="bold med-size">Patient Age</h2>
              <p className="color_grey">1y 11m</p>
            </div>
            <div className="half_width">
              <h2 className="bold med-size">Performed Station AETitle</h2>
              <p className="color_grey">Station1234</p>
            </div>
          </div>
        </div>
        <div className="half_width padding_2rem s-large">
          Chest  X-Ray of suspected patient. Other Description sjdsakdnksandksnanjkdsnkda
        </div>
      </div>
      <div className="padding_left_right_2rem">
        <Alert isInline variant="warning" title="Select frontal chest images only">
          <p>Non-frontal chest images will result in invalid predictive analysis results</p>
        </Alert>
      </div>
      <div className="padding_2rem">
        <div className="border-bottom-grey">
          <h1 className="study-title">Series</h1>
        </div>
        <div className="flex_row_wrap">
          <div className="half_width margin-top-bottom">
            <label className="container blueText">COR_Chest (fast)
              <input type="checkbox" checked={true} onChange={() => console.log('clicked')} />
              <span className="checkmark"></span>
            </label>
          </div>

          <div className="half_width margin-top-bottom">
            <label className="container">COR_Chest (fast)
              <input type="checkbox" checked={false} onChange={() => console.log('clicked')} />
              <span className="checkmark"></span>
            </label>
          </div>

          <div className="half_width margin-top-bottom">
            <label className="container blueText">COR_Chest (fast)
              <input type="checkbox" checked={true} onChange={() => console.log('clicked')} />
              <span className="checkmark"></span>
            </label>
          </div>

        </div>
      </div>
    </div>
  )
}

export default SelectedStudyDetail;