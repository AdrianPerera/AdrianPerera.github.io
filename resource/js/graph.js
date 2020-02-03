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
                tickCount: 8
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
        chart.axis('Date', {
            label: {
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
        });

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





    }
});
