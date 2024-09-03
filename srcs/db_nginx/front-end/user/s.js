const ctx = document.getElementById('myChart').getContext('2d');

 const doughnut =  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5,],
        backgroundColor:
        [
          'rgba(255,99,132,0.2)',
          'rgba(54,162,235,0.2)',
          'rgba(255,206,86,0.2)',
          'rgba(75,192,192,0.2)',
          'rgba(153,102,255,0.2)',
          'rgba(255,159,64,0.2)',
        ],
        borderColor:[
          'rgba(255,99,132,1)',
          'rgba(54,162,235,1)',
          'rgba(255,206,86,1)',
          'rgba(75,192,192,1)',
          'rgba(135,102,255,1)',
          'rgba(255,159,64,1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: {
            labels: {
                color: 'white',
                font: {
                    size: 14,
                    weight: 'bold'
                }
            }
        }},
      datalabels: {
        color: 'white', // Set the color of the data labels
        font: {
            size: 16,
            weight: 'bold'
        }},
      scales: {
        y: {
          beginAtZero: true,
          ticks :{
            color : 'white'
          }
        },
        x: {
          ticks: {
              color: 'white' // Set the color of the x-axis text
          }
      }
      }
    }
  });