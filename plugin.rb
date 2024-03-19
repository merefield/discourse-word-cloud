# name: discourse-word-cloud
# about: Builds and displays a word cloud on your forum
# email contacts: robert@thepavilion.io
# version: 0.41
# authors: Robert Barrow
# url: https://github.com/merefield/discourse-word-cloud


enabled_site_setting :word_cloud_enabled

register_asset 'stylesheets/common.scss'

after_initialize do
  %w(
    ../lib/engine.rb
    ../jobs/world_cloud_calc.rb
    ../serializers/word_count.rb
    ../app/controllers/word_count.rb
    ../config/routes.rb
  ).each do |path|
    load File.expand_path(path, __FILE__)
  end
end
