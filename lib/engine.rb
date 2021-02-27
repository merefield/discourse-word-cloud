module ::WordCloud
  class Engine < ::Rails::Engine
    engine_name 'word_cloud'
    isolate_namespace WordCloud
  end
  
  PLUGIN_NAME ||= 'word_cloud'
end