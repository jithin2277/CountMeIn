module.exports = function (grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({
    less: {
      development: {
        files: {
          "public/css/main.css": "less/main.less" // destination file and source file
        }
      }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'public/css',
          src: ['*.css', '!*.min.css'],
          dest: 'public/css',
          ext: '.min.css'
        }]
      }
    },
    uglify: {
      my_target: {
        files: {
          "public/js/site.min.js": ["scripts/vue-google-signin-button.js", "scripts/site.js"],
          "public/js/admin.min.js": ["scripts/admin.js"]
        }
      }
    },
    watch: {
      styles: {
        files: ['less/**/*.less'],
        tasks: ['less', 'cssmin'],
        options: {
          nospawn: true
        }
      },
      scripts: {
        files: ['scripts/**/*.js'],
        tasks: ['uglify'],
        options: {
          nospawn: true
        },
      }
    }
  });

  grunt.registerTask('default', ['less', 'cssmin', 'uglify', 'watch']);
};