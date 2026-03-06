import ReactApexChart from 'react-apexcharts';

const chartData = {
  series: [38.6, 22.5, 30.8, 8.1],
  options: {
    chart: {
      type: 'donut',
    },
    labels: ['Completed', 'Pendings', 'Ongoing', 'On hold'],
    colors: ['#C6C7F8', '#95A4FC', '#BAEDBD', '#B1E3FF'],
  },
};

const PieChart = () => {
  return (
    // <div className="flex justify-center">
    //   <div className="bg-white rounded-lg w-[520px]">
    //     <ReactApexChart
    //       height={410}
    //       options={chartData.options}
    //       series={chartData.series}
    //       type="donut"
    //     />
    //   </div>
    // </div>

    <div className="bg-white rounded-lg ">
      <ReactApexChart
        height={300}
        options={chartData.options}
        series={chartData.series}
        type="donut"
      />
    </div>
  );
};

export default PieChart;
