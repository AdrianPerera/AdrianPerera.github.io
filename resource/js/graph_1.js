//function for converting date format
function dateConverter(match, p1, p2, p3, offset, string) {
    var mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    p2 = mS[parseInt(p2) - 1];
    p1 = "20" + p1;
    return [p2, p3, p1].join(' ');
}

function dateFormatChange(date) {
    let year = "20" + date.substr(0, 2);
    let month = date.substr(3, 2) - 1; //offset change
    let day = date.substr(6, 2);
    return new Date(parseInt(year), month, day);
}
function addDate(newDate, days) {
    const date = new Date(newDate);
    date.setDate(date.getDate() + days - 1);
    return date;
}
function countDays(firstDate, secondDate) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((firstDate - secondDate) / oneDay)); //calibrate for one day miss
}
function average(data) {
    const sum = data.reduce(function (a, b) {
        return a + parseFloat(b.value);
    }, 0);
    const avg= sum/data.length;
    return Math.round(avg,4);
}

fetch('bitcoin.json')
    .then(res => res.json())
    .then(data => {
        const ds = new DataSet({
            state: {
                dates: null,
            }
        });
        const dv = ds.createView('origin').source(data);
        dv.transform({
            type: 'filter',
            callback: obj => {
                if (ds.state.dates) {
                    return ds.state.dates.indexOf(obj.date) > -1;
                }
                return obj;
            }
        });

        const chart = new G2.Chart({
            container: 'container',
            forceFit: true,
            height: 450,
            padding: [40, 45, 20, 60],
            animate: false
        });

        chart.source(dv, {
            date: {
                tickCount: 8
            },
            value: {
                type: 'linear',
                tickCount: 8,
            }
        });
        chart.axis('date', {
            label: {
                textStyle: {
                    fill: '#aaaaaa'
                },
                formatter: text => {
                    return text.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter);
                }
            }

        });

        chart.axis('value', {
            label: {
                textStyle: {
                    fill: '#aaaaaa'
                },
                formatter: text => {
                    if (text === "0") {
                        return "0";
                    } else {
                        return "$" + text.substr(0, text.length - 3) + "k";
                    }
                }
            },
            title: true,
            grid: {
                type: 'line',
                lineStyle: {
                    stroke: '#d9d9d0',
                    lineWidth: 1.5,
                    lineDash: [4, 4]
                },
                align: 'justify'
            }
        });
        chart.line()
            .position('date*value')
            .color('#000000')
            .size(1);


        chart.tooltip(true);

        chart.render();

        chart.interact('brush', {
            type: 'X',
            draggable: true,
            inPlot: true,
            onBrushmove(event) {
                const { data } = event;
                console.log(data);
                const avg= average(data);
                $('#starting_date').text(data[0].date);
                $('#ending_date').text(data[data.length - 1].date);
                $('#dca_value').text(avg);
                $('#no_days').text(data.length);
            }
        });

        const chart2 = new G2.Chart({
            container: 'container2',
            forceFit: true,
            height: 70,
            padding: [10, 45, 30, 60],
            animate: false

        });
        chart2.source(data, {
            date: {
                tickCount: 10
            },
            value: {
                type: 'linear'
            }
        });
        chart2.axis('date', {
            label: {
                formatter: text => {
                    return text.replace(/(\d{2})-(\d{2})-(\d{2})/g, function year(match, p1) {
                        p1 = "20" + p1;
                        return p1;
                    });
                }
            }

        });

        chart2.tooltip(false);
        chart2.axis('value', false);
        chart2.area().position('date*value').active(false)
            .color('#3f981d')
            .opacity(0.85);

        chart2.render();
        chart2.interact('brush', {
            type: 'X',
            draggable: true,
            inPlot: false,
            onBrushstart() {
                $('#starting_date').text(0);
                $('#ending_date').text(0);
                $('#dca_value').text(0);
                $('#no_days').text(0);
            }
            ,
            onBrushend(ev) {
                const { date } = ev;
                ds.setState('dates', date);
            },
            onDragMove(ev) {
                const { date } = ev;
                ds.setState('dates', date);
            }
        });
    });
