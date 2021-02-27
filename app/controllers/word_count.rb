class ::WordCloud::WordCountController < ::ApplicationController

  def data
    raise Discourse::InvalidAccess.new unless current_user

    result = PluginStoreRow.where("key = 'world_cloud_list'").first

    render_json_dump word_count: (JSON.parse (result[:value]))
  end

end
