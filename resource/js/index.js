function dateConverter(match, p1, p2, p3, offset, string) {
    var mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    p2 = mS[parseInt(p2) - 1];
    p1 = "20" + p1;
    return [p2, p3, p1].join(' ');
}

fetch('bitcoin.json')
    .then(res => res.json())
    .then(data => {
        const ds = new DataSet({
            state: {
                start: '13-10-10',
                end: '19-12-12'
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
            height: 400,
            padding: [40, 45, 20, 60],
            animate: true
        });

        chart.source(dv, {
            date: {
                tickCount: 8
            },
            value: {
                type: 'linear',
                tickInterval: 2000
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
                formatter: text=>{
                if(text==="0"){return  "0";}
                else {
                return "$"+text.substr(0,text.length-3)+"k";
                }
            }
            },
            title:true,
            grid: {
                type: 'line',
                lineStyle: {
                    stroke: '#d9d9d0',
                    lineWidth: 1.5,
                    lineDash: [4,4]
                },
                align: 'justify'
            }
        });
        chart.area()
            .position('date*value')
            .color('#f89e31')
            .size(0.5);
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
            onBrushstart() {

            }, onBrushend(event) {
                let arrayLength = event.date.length;
                let startingDate = event.date[0];
                let endingDate = event.date[arrayLength - 1];
                $('#starting_date').text(startingDate.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter));
                $('#ending_date').text(endingDate.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter));
                var dailyvalue = 0;
                for (var i in event.value) {
                    dailyvalue += parseFloat(event.value[i]);
                }
                var dcaValue = "$" + (dailyvalue / arrayLength).toFixed(2);
                //console.log(dailyvalue, arrayLength, dcaValue);
                $('#dca_value').text(dcaValue);
            }
        });

        const chart2 = new G2.Chart({
            container: 'container2',
            forceFit: true,
            height: 70,
            padding:  [10, 45, 30, 60],
            animate: true
        });
        chart2.source(data, {
            date: {
                tickCount: 10
            },
            value: {
                type:'linear'
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
            onBrushmove(ev) {
                const  dateArray  = ev.date;
                ds.setState('start', dateArray[0]);
                ds.setState('end', dateArray[dateArray.length - 1]);
            }
        });
    });
