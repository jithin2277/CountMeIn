module.exports = function(grunt) {
    require('jit-grunt')(grunt);
  
    grunt.initConfig({
      less: {
        development: {
          files: {
            "public/css/main.css": "less/main.less" // destination file and source file
          }
        }
      },
      watch: {
        styles: {
          files: ['less/**/*.less'], // which files to watch
          tasks: ['less'],
          options: {
            nospawn: true
          }
        }
      }
    });
  
    grunt.registerTask('default', ['less', 'watch']);
  };