import { BarChartHorizontal } from "./components/Bar Chart - Horizontal";
import { BarChartInteractive } from "./components/Bar Chart - Interactive";

export default function Overview() {
  return (
    <>
      <BarChartInteractive />
      <BarChartHorizontal/>
    </>
  )
}