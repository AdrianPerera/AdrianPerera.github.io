var data;
var json = [];
$.ajax({
    type: "GET",
    url: "BTUSD.csv",
    dataType: "text",
    success: function (response) {
        const testCSV = response;
        const dv1 = new DataSet.View().source(testCSV, {
            type: 'csv',
        });
        data = dv1.rows
        data = data.reverse();
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
                tickCount: 10
            },
            Open: {
                type: 'linear',
                tickInterval: 2000
            }
        });

        chart.axis('Open', {
            lable: {
                textStyle: {
                    fill: '#aaaaaa'
                }
            },
            grid: null
        });

        chart.line()
            .position('Date*Open')
            .color('black')
            .opacity(0.85)
            .size(0.75);
        chart.render();


        chart.interact('slider', {
            container: 'slider',
            padding: [40, 40, 40, 60],
            onChange: function slider(ev) {
                const { startValue, endValue } = ev;
                ds.setState('start', startValue);
                ds.setState('end', endValue);
            }
        })
        chart.interact('brush', {
            type: 'X',
            onBrushstart() {

            }, onBrushend(event) {
                let arrayLength = event.Date.length;
                let startingDate = event.Date[0];
                let endingDate = event.Date[arrayLength - 1];
                        $('#starting_date').text(startingDate);
                $('#ending_date').text(endingDate);
            }
        });





    }
});
