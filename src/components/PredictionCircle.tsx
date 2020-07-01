import React from "react";
import { ChartDonutUtilization } from '@patternfly/react-charts';

interface circleProps {
  largeCircle: boolean;
  predictionNumber: number;
}

const PredictionCircle = (props: circleProps) => {
  const { largeCircle, predictionNumber } = props
  let size = 120
  let divSize = '100px'
  if (!largeCircle) {
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