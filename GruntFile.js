module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: [{
            expand: true,
            src: '**/*.js',
            dest: 'build/<%= pkg.name %>/js/',
            cwd: 'src/js/'
        }]
      }
    },
    cssmin: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: [{
            expand: true,
            src: '**/*.css',
            dest: 'build/<%= pkg.name %>/css/',
            cwd: 'src/css/'
        }]
      }
    },
    copy: {
      main: {
        files: [
          // includes files within path
          {
            expand: true,
            src: ['**/*'],
            dest: 'build/<%= pkg.name %>/images/',
            cwd: 'src/images/'
          },
          {
            expand: true,
            src: ['index.html'],
            dest: 'build/<%= pkg.name %>/',
            cwd: 'src'
          },
          {
            expand: true,
            src: ['js/utils/proxy.php'],
            dest: 'build/<%= pkg.name %>/',
            cwd: 'src'
          }
        ]
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', [
    'uglify',
    'cssmin',
    'copy'
  ]);

};




















