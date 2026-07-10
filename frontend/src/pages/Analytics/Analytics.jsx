import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./Analytics.css";


function Analytics() {


  const wasteTrend = [
    { month: "Jan", waste: 2000 },
    { month: "Feb", waste: 3200 },
    { month: "Mar", waste: 2800 },
    { month: "Apr", waste: 4500 },
    { month: "May", waste: 5200 },
    { month: "Jun", waste: 6100 },
  ];



  const materialData = [
    { name:"Cotton", value:40 },
    { name:"Polyester", value:30 },
    { name:"Denim", value:20 },
    { name:"Silk", value:10 },
  ];



  const processingData = [
    { name:"Recycled", value:60 },
    { name:"Processing", value:25 },
    { name:"Pending", value:15 },
  ];



  const materialRanking = [
    {
      name:"Cotton",
      percentage:40
    },
    {
      name:"Polyester",
      percentage:30
    },
    {
      name:"Denim",
      percentage:20
    },
    {
      name:"Silk",
      percentage:10
    }
  ];



  const predictions = [
    {
      image:"fabric1.jpg",
      material:"Cotton",
      confidence:"96%",
      date:"Today"
    },
    {
      image:"cloth2.jpg",
      material:"Denim",
      confidence:"91%",
      date:"Today"
    },
    {
      image:"textile3.jpg",
      material:"Polyester",
      confidence:"94%",
      date:"Yesterday"
    }
  ];



  return (

    <div className="analytics">


      <div className="analytics-header">

        <h1>
          Waste Analytics Dashboard
        </h1>

        <p>
          Monitor textile waste intelligence and sustainability performance.
        </p>

      </div>



      <div className="analytics-cards">


        <div className="analytics-card">
          <h3>Total Textile Waste</h3>
          <h2>12,450 kg</h2>
          <span>↑ 12% this month</span>
        </div>



        <div className="analytics-card">
          <h3>Recycled Materials</h3>
          <h2>8,320 kg</h2>
          <span>↑ 8% improvement</span>
        </div>



        <div className="analytics-card">
          <h3>Carbon Saved</h3>
          <h2>2,540 kg</h2>
          <span>Environmental impact</span>
        </div>



        <div className="analytics-card">
          <h3>AI Accuracy</h3>
          <h2>94.6%</h2>
          <span>Model performance</span>
        </div>


      </div>




      <div className="chart-card full-chart">

        <h2>
          Waste Generated Over Time
        </h2>


        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={wasteTrend}>

            <XAxis dataKey="month"/>

            <YAxis/>

            <Tooltip/>

            <Line
              dataKey="waste"
              stroke="#1565c0"
              strokeWidth={3}
            />

          </LineChart>


        </ResponsiveContainer>


      </div>




      <div className="charts-container">


        <div className="chart-card">

          <h2>
            Material Distribution
          </h2>


          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={materialData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >

                {
                  materialData.map(
                    (item,index)=>(
                      <Cell key={index}/>
                    )
                  )
                }

              </Pie>

              <Tooltip/>

            </PieChart>


          </ResponsiveContainer>


        </div>





        <div className="chart-card">

          <h2>
            Processing Status
          </h2>


          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={processingData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >

                {
                  processingData.map(
                    (item,index)=>(
                      <Cell key={index}/>
                    )
                  )
                }

              </Pie>

              <Tooltip/>

            </PieChart>


          </ResponsiveContainer>


        </div>


      </div>





      <div className="intelligence-section">


        <div className="chart-card">


          <h2>
            Material Intelligence
          </h2>


          {
            materialRanking.map((item,index)=>(

              <div
                className="material-progress"
                key={index}
              >

                <div className="material-title">

                  <span>
                    {item.name}
                  </span>

                  <strong>
                    {item.percentage}%
                  </strong>

                </div>


                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{
                      width:`${item.percentage}%`
                    }}
                  >

                  </div>

                </div>


              </div>

            ))
          }


        </div>





        <div className="chart-card sustainability-score">


          <h2>
            Sustainability Score
          </h2>


          <div className="score-circle">
            86
          </div>


          <p>
            Excellent environmental impact performance
          </p>


        </div>


      </div>





      <div className="chart-card">


        <h2>
          Recent AI Predictions
        </h2>


        <table>

          <thead>

            <tr>
              <th>Image</th>
              <th>Material</th>
              <th>Confidence</th>
              <th>Date</th>
            </tr>

          </thead>


          <tbody>

            {
              predictions.map((item,index)=>(

                <tr key={index}>

                  <td>{item.image}</td>

                  <td>{item.material}</td>

                  <td>{item.confidence}</td>

                  <td>{item.date}</td>

                </tr>

              ))
            }

          </tbody>


        </table>


      </div>




      <button className="report-btn">
        Download Analytics Report
      </button>


    </div>

  );

}


export default Analytics;