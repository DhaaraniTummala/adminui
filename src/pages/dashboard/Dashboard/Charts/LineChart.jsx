import { LineChart } from '@mui/x-charts/LineChart';

const uData = [5000, 3000, 2000, 2780, 1890, 2390, 3490];
const pData = [2400, 1398, 4000, 3908, 4800, 3800, 4300];
const xLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SimpleLineChart() {
  return (
    <div className="mt-6 p-2 mx-auto rounded-lg scrollBars max-w-full  w-[100%] dark:bg-white">
      <div className="overflow-x-auto">
        <div className="relative w-full">
          <LineChart
            height={270}
            series={[{ data: pData }, { data: uData }]}
            xAxis={[{ scaleType: 'point', data: xLabels }]}
          />
        </div>
      </div>
    </div>
  );
}
