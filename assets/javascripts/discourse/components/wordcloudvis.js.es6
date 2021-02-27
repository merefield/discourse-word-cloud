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
      // Encapsulate the word cloud functionality
      function wordCloud(selector) {
        var fill = d3.schemeCategory20;

        //Construct the word cloud's SVG element
        var svg = d3
          .select(selector)
          .append("svg")
          .attr("width", 1100)
          .attr("height", 550)
          .append("g")
          .attr("transform", "translate(550,275)");

        //Draw the word cloud
        function draw(words) {
          debugger;
          var cloud = svg.selectAll("g text").data(words, function (d) {
            return d.text;
          });

          //Entering words
          cloud
            .enter()
            .append("text")
            .style("font-family", "Impact")
            .style("fill", function () {
              return "hsl(" + Math.random() * 360 + ",40%,40%)";
            })
            .attr("text-anchor", "middle")
            .attr("font-size", 0)
            .text(function (d) {
              return d.text;
            });

          //Entering and existing words
          cloud
            .transition()
            .duration(1200)
            .style("font-size", function (d) {
              return d.size + "px";
            })
            .attr("transform", function (d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("fill-opacity", 1);

          //Exiting words
          cloud
            .exit()
            .transition()
            .duration(200)
            .style("fill-opacity", 1e-6)
            .attr("font-size", 1)
            .remove();
        }

        //Use the module pattern to encapsulate the visualisation code. We'll
        // expose only the parts that need to be public.
        return {
          //Recompute the word cloud for a new set of words. This method will
          // asycnhronously call draw when the layout has been computed.
          //The outside world will need to call this function, so make it part
          // of the wordCloud return value.
          update: function (words) {
            debugger;
            d3.layout
              .cloud()
              .size([1100, 550])
              .words(words)
              .padding(5)
              .rotate(function () {
                return ~~(Math.random() * 2) * 90;
              })
              .font("Impact")
              .fontSize(function (d) {
                return d.size;
              })
              .on("end", draw)
              .start();
          },
        };
      }

      //Prepare one of the sample sentences by removing punctuation,
      // creating an array of words and computing a random size attribute.
      function getWords() {
        return _this.words.map(function (d) {
          return { text: d.text, size: 10 + Math.random() * 90 };
        });
      }

      //This method tells the word cloud to redraw with a new set of words.
      //In reality the new words would probably come from a server request,
      // user input or some other source.
      function showNewWords(vis, i) {
        i = i || 0;

        var these_words = getWords();
        debugger;
        vis.update(these_words);

        setTimeout(function () {
          showNewWords(vis, i + 1);
        }, 5000);
      }

      //Create a new instance of the word cloud visualisation.
      var myWordCloud = wordCloud(".word-cloud-vis");

      //Start cycling through the demo data
      debugger;
      showNewWords(myWordCloud);
    });
  },
});
