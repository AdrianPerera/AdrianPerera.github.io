function dateConverter(match, p1, p2, p3, offset, string) {
    var mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    p2 = mS[parseInt(p2) - 1];
    p1 = "20" + p1;
    return [p2, p3, p1].join(' ');
}

var data;

$.ajax({
    type: "GET",
    url: "BTUSD.csv",
    dataType: "text",
    success: function (response) {
        const testCSV = response;
        const dv1 = new DataSet.View().source(testCSV, {
            type: 'csv',
        });
        data = dv1.rows;
        data = data.reverse();
        const ds = new DataSet({
            state: {
                start: '13-10-10',
                end: '19-12-12'
            }
        });
        const dv = ds.createView('origin').source(data);
        console.log(ds)
        dv.transform({
            type: 'filter',
            callback: function callbaack(obj) {
                const Date = obj.Date;
                return Date >= ds.state.start && Date <= ds.state.end;

            }
        });

        const chart = new G2.Chart({
            container: 'container',
            forceFit: true,
            height: 400,
            padding: [40, 40, 40, 60],
            animate: false
        });

        chart.source(dv, {
            Date: {
                tickCount: 8
            },
            Open: {
                type: 'linear',
                tickInterval: 2000
            }
        });

        chart.axis('Open', {
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
            },grid: {
                type: 'line',
                lineStyle: {
                    stroke: '#d9d9d0',
                    lineWidth: 1.5,
                    lineDash: [4,4]
                },
                align: 'justify'
            },
            title:true
        });
        chart.axis('Date', {
            label: {
                textStyle: {
                    fill: '#aaaaaa'
                },
                formatter: text => {
                    return text.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter);
                }
            }
        });

        chart.tooltip(true, {
            showTitle: true,
            title: 'Date'
        });

        chart.line()
            .position('Date*Open')
            .color('#000000')
            .size(1);

        chart.render();

        chart.interact('brush', {
            type: 'X',
            onBrushstart() {

            }, onBrushend(event) {
                let arrayLength = event.Date.length;
                let startingDate = event.Date[0];
                let endingDate = event.Date[arrayLength - 1];
                $('#starting_date').text(startingDate.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter));
                $('#ending_date').text(endingDate.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter));
                var dcaValue = 0, dailyvalue = 0;
                for (var i in event.Open) {
                    dailyvalue += parseFloat(event.Open[i]);
                }
                dcaValue = "$ " + (dailyvalue / arrayLength).toFixed(2);
                console.log(dailyvalue, arrayLength, dcaValue);
                $('#dca_value').text(dcaValue);

            }
        });

        const chart2 = new G2.Chart({
            container: 'container2',
            forceFit: true,
            height: 70,
            padding: [10, 45, 30, 60],
            animate: true
        });
        chart2.source(dv1,{
            Date: {
                tickCount: 10
            },
            Open: {
                type: 'linear'
            }
        })
        chart2.axis('Date', {
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
        chart2.axis('Open', false);
        chart2.area().position('Date*Open').active(true)
            .color('#3f981d')
            .opacity(0.85);
        chart2.render();
        chart2.interact('brush', {
            type: 'X',
            draggable: true,
            inPlot: false,
            onBrushmove(ev) {
                const dateArray = ev.Date;
                ds.setState('start', dateArray[0]);
                ds.setState('end', dateArray[dateArray.length - 1]);

                let arrayLength = dateArray.length;
                let startingDate = ev.Date[0];
                let endingDate = ev.Date[arrayLength - 1];

                $('#starting_date').text(startingDate.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter));
                $('#ending_date').text(endingDate.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter));
                var dailyvalue = 0;
                for (let i in ev.Open) {
                    dailyvalue += parseFloat(ev.Open[i]);
                }
                var dcaValue = "$" + (dailyvalue / arrayLength).toFixed(2);
                console.log(dailyvalue, arrayLength, dcaValue);
                $('#dca_value').text(dcaValue);
            },
        });
    }
});
