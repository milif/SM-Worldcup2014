# Require any additional compass plugins here.

# Combine media_queries
# https://github.com/aaronjensen/sass-media_query_combiner
require 'sass-media_query_combiner'


#https://github.com/team-sass/breakpoint
require 'breakpoint'

# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "build/.css"
sass_dir = "build/.scss"
images_dir = "assets/i"
fonts_dir = "assets/fonts"
add_import_path "src/"

# You can select your preferred output style here (can be overridden via the command line):
output_style = :expanded # or :nested or :compact or :compressed
# environment = :production

# To enable relative paths to assets via compass helper functions. Uncomment:
relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
line_comments = true


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
