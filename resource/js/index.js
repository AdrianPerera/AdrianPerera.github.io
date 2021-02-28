//function for converting date format
function dateConverter(match, p1, p2, p3, offset, string) {
    var mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    p2 = mS[parseInt(p2) - 1];
    p1 = "20" + p1;
    return [p2, p3, p1].join(' ');
}

function dateFormatChange(date){
    let year= "20" +date.substr(0,2);
    let month= date.substr(3,2)-1; //offset change
    let day= date.substr(6,2);
    return new Date(parseInt(year), month, day);
}
function addDate(newDate,days){
    const date = new Date(newDate);
    date.setDate(date.getDate() + days-1);
    return date;
}
function countDays(firstDate,secondDate){
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((firstDate - secondDate) / oneDay)); //calibrate for one day miss
}

fetch('bitcoin.json')
    .then(res => res.json())
    .then(data => {
        const ds = new DataSet({
            state: {
                start: '14-10-13',
                end: '21-02-26',
                chartArrayLength:0,
                chartSelectedLength:0,
                ca:0,
                da:0,
                sliderSelectedLength:0
            }
        });
        const dv = ds.createView('origin').source(data);
        dv.transform({
            type: 'filter',
            callback: function callbaack(obj) {
                const date = obj.date;
                return date >= ds.state.start && date <= ds.state.end;

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
                tickCount:10
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
        chart.area()
            .position('date*value')
            .color('#f89e31')
            .size(0.5);


        chart.tooltip(true, {
                showTitle: true,
                title: 'date'
            }
        )
        chart.render();
        //chart.interact('slider', {
        //    container: 'slider',
        //    padding: [40, 45, 20, 40],
        //    backgroundChart: {
        //        type: 'area',
        //        color:"green"
        //    },
        //    onChange: function slider(ev) {
        //        const { startValue, endValue } = ev;
        //        ds.setState('start', startValue);
        //        ds.setState('end', endValue);
        //    }
        //})
        chart.interact('brush', {
            type: 'X',
            onBrushmove(event) {
                let dateArraySelected= event.date;
                let chartSelectedLength = dateArraySelected.length;
                $('#no_days').text(chartSelectedLength);
            }, onBrushend(event) {

                let dateArraySelected= event.date;
                let chartSelectedLength = dateArraySelected.length;
                let startingDateSelected = dateArraySelected[0];
                let endingDateSelected = dateArraySelected[chartSelectedLength - 1];
                const ca= countDays(dateFormatChange(startingDateSelected),dateFormatChange(ds.state.start));
                const da= countDays(dateFormatChange(endingDateSelected),dateFormatChange(ds.state.start));
                ds.setState('chartSelectedLength', chartSelectedLength); //setting chartSelectedArray length to the state
                ds.setState('ca',ca);
                ds.setState('da',da);
                // console.log(event.date);
                // console.log(dateFormatChange(startingDateSelected),addDate(dateFormatChange(startingDateSelected),chartSelectedLength),countDays(dateFormatChange(startingDateSelected),dateFormatChange(endingDateSelected)));
                // console.log(startingDateSelected,endingDateSelected,ca,da);
                // console.log(dv.rows[ca].date,dv.rows[da].date);
                $('#starting_date').text(startingDateSelected.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter));
                $('#ending_date').text(endingDateSelected.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter));
                var dailyvalue = 0;
                for (var i in event.value) {
                    dailyvalue += parseFloat(event.value[i]);
                }
                var dcaValue = "$ " + (dailyvalue / chartSelectedLength).toFixed(2);
                //console.log(dailyvalue, arrayLength, dcaValue);
                $('#dca_value').text(dcaValue);
                $('#no_days').text(chartSelectedLength);
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
                ds.setState('chartSelectedLength',0)
            }
            ,
            onBrushmove(ev) {
                let dateArray = ev.date;
                let sliderArrayLength = dateArray.length;
                let sliderStartingDate = dateArray[0];
                let sliderEndingDate = dateArray[sliderArrayLength - 1];

                ds.setState('start', sliderStartingDate);
                ds.setState('end', sliderEndingDate);

                const dateArraySelected= dateArray.slice(ds.state.ca,ds.state.da+1);
                const valueArraySelected= ev.value.slice(ds.state.ca,ds.state.da+1);
                // console.log(ds.state.ca,ds.state.da,dateArraySelected,valueArraySelected);
                if(ds.state.chartSelectedLength>0){
                    $('#starting_date').text(dateArraySelected[0].replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter));
                    $('#ending_date').text(dateArraySelected[dateArraySelected.length-1].replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter));
                    var dailyvalue = 0;
                    for (var j in valueArraySelected) {
                            dailyvalue += parseFloat(valueArraySelected[j]);
                    }
                    var dcaValue = "$ " + (dailyvalue / sliderArrayLength).toFixed(2);
                    $('#dca_value').text(dcaValue);
                    $('#no_days').text(dateArraySelected.length);
                }

            },
        });
    });
