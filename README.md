# Pro.JSONLIN fork (Salvaged)


## Installation

1. After cloning this repo, you'll need grunt. Install it with `sudo npm install -g grunt-cli`
2. Run `npm install` to install dev dependencies.
3. Run `npm run build` to build project.
4. Copy apache configs present in `src/apache-configs/` to `/etc/apache2/sites-available/`. (Mind the numbering)
5. Enable site with `sudo a2ensite 023-jsonlint.onlinesales.ai.conf`. Using `jsonlint.onlinesales.ai` so that you can use `onlinesales.ai` cookies.
6. Update document root to you `build/pro.jsonlint.com/`  folder
7. Reload apache with `sudo service apache2 reload`.
8. Add entry to `/etc/hosts` 
    ```
    # Entry for jsonlint.onlinesales.ai
    127.0.0.1 jsonlint.onlinesales.ai
    ```
9. Now you should be able to use [http://jsonlint.onlinesales.ai](http://jsonlint.onlinesales.ai) from browser.

## Added features
1. Support for cookies
