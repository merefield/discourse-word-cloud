Discourse::Application.routes.append do
  mount ::WordCloud::Engine, at: "/"

  # get "wordcloud" => "word_count#data"
end

WordCloud::Engine.routes.draw do
  get "wordcloud" => "word_count#data"
end
