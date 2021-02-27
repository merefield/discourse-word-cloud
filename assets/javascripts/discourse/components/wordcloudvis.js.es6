import loadScript from "discourse/lib/load-script";

export default Ember.Component.extend({
  classNames: "word-cloud-vis",
  words: Ember.computed.alias("model.words"),

  ensureD3() {
    return loadScript("/plugins/discourse-word-cloud/d3/d3.min.js").then(() => {
      return loadScript("/plugins/discourse-word-cloud/d3/d3.layout.cloud.js");
    });
  },

  didInsertElement() {
    this.setup();
  },

  setup() {
    var _this = this;

    this.ensureD3().then(() => {

      var layout = d3.layout
        .cloud()
        .size([1100, 1100])
        .words(
          _this.words
        )
        .padding(5)
        .rotate(function () {
          return ~~(Math.random() * 2) * 90;
        })
        .font("Impact")
        .fontSize(function (d) {
          return d.size;
        })
        .on("end", draw);
      layout.start();

      function draw(words) {
        d3.select('.word-cloud-vis')
          .append("svg")
          .attr("width", layout.size()[0])
          .attr("height", layout.size()[1])
          .append("g")
          .attr(
            "transform",
            "translate(" +
              layout.size()[0] / 2 +
              "," +
              layout.size()[1] / 2 +
              ")"
          )
          .selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .style("font-size", function (d) {
            return d.size + "px";
          })
          .style("font-family", "Impact")
          .attr("text-anchor", "middle")
          .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function (d) {
            return d.text;
          });
      }
    });
  },
});
