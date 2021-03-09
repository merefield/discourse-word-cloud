import DiscourseRoute from "discourse/routes/discourse";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { ajax } from "discourse/lib/ajax";

const settings = Discourse.SiteSettings;

export default DiscourseRoute.extend({
  model(data, transition) {
    return ajax("/wordcloud.json")
      .then((result) => {
        return Ember.Object.create({
          words: result.word_count.map((w) => {
            return Ember.Object.create({
              text: w.word,
              href: `/search?q=${w.word}`,
              size: w.count,
            });
          }),
        });
      })
      .catch(popupAjaxError);
  },

  renderTemplate() {
    this.render("wordcloud", {
      controller: "wordcloud",
    });
  },
});
