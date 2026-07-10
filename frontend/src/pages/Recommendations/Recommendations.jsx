import "./Recommendations.css";


function Recommendations() {


  const recommendations = [

    {
      icon:"♻️",
      title:"Cotton Recycling",
      material:"Cotton",
      description:
      "Convert cotton waste into recycled fibers, insulation materials, and new textile products.",
      impact:"90% Recovery Potential"
    },


    {
      icon:"🌱",
      title:"Reduce Textile Waste",
      material:"General",
      description:
      "Improve sorting efficiency and reduce landfill contribution through automated classification.",
      impact:"35% Waste Reduction"
    },


    {
      icon:"🔄",
      title:"Polyester Reuse",
      material:"Polyester",
      description:
      "Recycle polyester fabrics into reusable fibers and sustainable clothing materials.",
      impact:"80% Reusability"
    },


    {
      icon:"🧵",
      title:"Denim Upcycling",
      material:"Denim",
      description:
      "Transform old denim into accessories, insulation products, and regenerated fabrics.",
      impact:"75% Resource Saving"
    }

  ];



  return (

    <div className="recommendations">


      <div className="recommendation-header">

        <h1>
          AI Sustainability Recommendations
        </h1>


        <p>
          AI-powered suggestions for textile waste recycling and reuse strategies.
        </p>


      </div>





      <div className="recommendation-summary">


        <div>

          <h3>
            AI Suggestions
          </h3>

          <h2>
            24
          </h2>

        </div>



        <div>

          <h3>
            Waste Recovery Score
          </h3>

          <h2>
            86%
          </h2>

        </div>



        <div>

          <h3>
            Environmental Impact
          </h3>

          <h2>
            High
          </h2>

        </div>


      </div>





      <div className="recommendation-grid">


        {
          recommendations.map((item,index)=>(


            <div
              className="recommendation-card"
              key={index}
            >


              <div className="recommendation-icon">

                {item.icon}

              </div>



              <h2>

                {item.title}

              </h2>



              <span>

                {item.material}

              </span>



              <p>

                {item.description}

              </p>



              <strong>

                {item.impact}

              </strong>



            </div>


          ))
        }


      </div>



    </div>

  );

}


export default Recommendations;