import Component from "@glimmer/component";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import { service } from "@ember/service";
import { bind } from "discourse/lib/decorators";
import loadScript from "discourse/lib/load-script";
import DiscourseURL from "discourse/lib/url";

export default class Wordcloudvis extends Component {
  @service siteSettings;

  get words() {
    return this.args.model?.words ?? [];
  }

  get hasItems() {
    return this.words.length > 0;
  }

  async ensureD3() {
    await loadScript("/plugins/discourse-word-cloud/d3/d3.min.js");
    await loadScript("/plugins/discourse-word-cloud/d3/d3.layout.cloud.js");

    return window.d3;
  }

  @bind
  async setup(element) {
    if (!this.hasItems) {
      return;
    }

    const d3 = await this.ensureD3();

    if (!d3?.layout?.cloud) {
      return;
    }

    element.replaceChildren();

    const layout = d3.layout
      .cloud()
      .size([
        this.siteSettings.word_cloud_width,
        this.siteSettings.word_cloud_height,
      ])
      .words(this.words)
      .padding(5)
      .rotate(() => Math.trunc(Math.random() * 2) * 90)
      .font("Impact")
      .fontSize((word) => word.size)
      .on("end", (words) => this.drawCloud(d3, element, layout, words));

    layout.start();
  }

  drawCloud(d3, element, layout, words) {
    d3.select(element)
      .append("svg")
      .attr("viewBox", `0 0 ${layout.size()[0]} ${layout.size()[1]}`)
      .append("g")
      .attr(
        "transform",
        `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`
      )
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", (word) => `${word.size}px`)
      .style("fill", () => `hsl(${Math.random() * 360},40%,40%)`)
      .style("font-family", "Impact")
      .attr("text-anchor", "middle")
      .attr(
        "transform",
        (word) => `translate(${[word.x, word.y]})rotate(${word.rotate})`
      )
      .on("mouseover", function () {
        const newFontSize =
          parseInt(d3.select(this).style("font-size"), 10) * 1.1 + "px";

        d3.select(this)
          .transition()
          .duration(100)
          .style("cursor", "pointer")
          .style("font-size", newFontSize)
          .style("fill", function () {
            return d3.rgb(d3.select(this).style("fill")).darker(-0.7);
          });
      })
      .on("mouseout", function () {
        const newFontSize =
          parseInt(d3.select(this).style("font-size"), 10) / 1.1 + "px";

        d3.select(this)
          .transition()
          .duration(100)
          .style("cursor", "default")
          .style("font-size", newFontSize)
          .style("fill", function () {
            return d3.rgb(d3.select(this).style("fill")).darker(0.7);
          });
      })
      .on("click", (_event, word) => {
        if (word.href) {
          DiscourseURL.routeTo(word.href);
        }
      })
      .text((word) => word.text);
  }

  <template>
    {{#if this.hasItems}}
      <div class="word-cloud-vis" {{didInsert this.setup}}></div>
    {{/if}}
  </template>
}
