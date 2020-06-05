import React from "react";
import { ChartDonutUtilization } from '@patternfly/react-charts';


interface circleProps {
  covidCircle: boolean;
  predictionNumber: number;
}

const PredictionCircle = (props: circleProps) => {
  const { covidCircle, predictionNumber } = props
  let size = 120
  let divSize = '100px'
  if (!covidCircle) {
    size = 150
    divSize = "80px"
  }
  return (
    <div style={{ height: divSize, width: divSize }}>
      <ChartDonutUtilization
        ariaDesc="Storage capacity"
        constrainToVisibleArea={true}
        data={{ x: 'Prediction', y: predictionNumber }}
        height={size}
        width={size}
        padding={0}
        title={`${predictionNumber}%`}
        thresholds={[{ value: 60 }, { value: 90 }]}
      />
    </div>
    // <span>{predictionNumber}%</span>
  )
}

export default PredictionCircle