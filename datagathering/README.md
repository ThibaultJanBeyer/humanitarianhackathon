# Data gathering scripts

This part of the repository, is dedicated to scripts which get data and
process it.

This c&a code by itself is not usable out of the box, as the data it builds on
is missing. It needs to be downloaded by hand. See the json data loaded by:

* http://sustainability.c-and-a.com/supplier-map/

## Setup draft

You'll need to have python 3.7 and poetry. Install poetry, then execute

```
$ poetry install
```

Afterwards, you can run jupyter with

```
$ poetry run jupyter notebook
```

## Links

* https://github.com/sdispater/poetry
* https://2.python-requests.org/en/master/
* https://www.crummy.com/software/BeautifulSoup/bs4/doc/#quick-start

* https://towardsdatascience.com/mapping-geograph-data-in-python-610a963d2d7f
