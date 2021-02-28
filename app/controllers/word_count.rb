class ::WordCloud::WordCountController < ::ApplicationController

  def data
    raise Discourse::InvalidAccess.new unless current_user

    result = PluginStore.get(::WordCloud::PLUGIN_NAME, "world_cloud_list")

    render_json_dump word_count: result
  end

end
