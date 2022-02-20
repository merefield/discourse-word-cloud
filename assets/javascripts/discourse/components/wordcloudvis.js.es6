import loadScript from "discourse/lib/load-script";
import DiscourseURL from "discourse/lib/url";
import { notEmpty } from "@ember/object/computed";
// import { computed } from '@ember/object';
import { observes } from 'discourse-common/utils/decorators';

export default Ember.Component.extend({
  classNames: "word-cloud-vis",
  words: Ember.computed.alias("model.words"),
  hasItems: notEmpty("words"),
  elementIsReady: null,

  ensureD3() {
    return loadScript("/plugins/discourse-word-cloud/d3/d3.min.js").then(() => {
      return loadScript("/plugins/discourse-word-cloud/d3/d3.layout.cloud.js");
    });
  },

  didInsertElement() {
    this.set("elementIsReady", true);
  },

  @observes('hasItems', 'elementIsReady')
  waitForDataAndElement () {
    if(this.hasItems && this.elementIsReady) {
      this.setup();
    }
  },

  setup() {
    var _this = this;

    this.ensureD3().then(() => {

      var layout = d3.layout
        .cloud()
        .size([this.siteSettings.word_cloud_width, this.siteSettings.word_cloud_height])
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
          .attr("viewBox", `0 0 ${layout.size()[0]} ${layout.size()[1]}`)
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
          .style("fill", function () {
            return "hsl(" + Math.random() * 360 + ",40%,40%)";
          })
          .style("font-family", "Impact")
          .attr("text-anchor", "middle")
          .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .on("mouseover", function(d,i) {
            let newFontSize = parseInt(d3.select(this).style("font-size"))*1.1 + "px";
            d3.select(this).transition()
            .duration(100)
            .style("cursor", "pointer")
            .style("font-size", newFontSize)
            .style("fill", function() {
              return d3.rgb(d3.select(this).style("fill")).darker(-0.7);
          });
          })
          .on("mouseout", function(d,i) {
            let newFontSize = parseInt(d3.select(this).style("font-size"))/1.1 + "px";
            d3.select(this).transition()
            .duration(100)
            .style("cursor", "default")
            .style("font-size", newFontSize)
            .style("fill", function() {
              return d3.rgb(d3.select(this).style("fill")).darker(0.7);
          });
          })
          .on('click', function(d, i) {
            if (d.target.__data__.href) { DiscourseURL.routeTo(d.target.__data__.href); }
          })
          .text(function (d) {
            return d.text;
          });
      }
    });
  },
});
