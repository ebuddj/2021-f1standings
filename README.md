# 2021-f1standings

**Live demo** https://ebuddj.github.io/2021-f1standings/

## F1 standings development (EBU)

This implementation is inspired by this post: https://www.instagram.com/p/CQ4ApHLIHDW/.

!!! Updated after each race !!!

### Customatizations
* Driver standings: https://ebuddj.github.io/2021-f1standings/#type=drivers
* Team standings: https://ebuddj.github.io/2021-f1standings/#type=teams
* Custom title: https://ebuddj.github.io/2021-f1standings/#type=drivers&title=my%20title%202021
  * Note: add spaces with `%20` syntax

**Sources**
* [ESPN](https://www.espn.com/f1/standings)
* [IBAN](https://www.iban.com/country-codes)

**EBU links**
* []()

**Used by**
* []()

## How to use

If you are interested in using the interactive version please contact Teemo Tebest, tebest@ebu.ch

This visualization is part of the EBU News Exchange’s Data Journalism project. Other projects are available: https://news-exchange.ebu.ch/data-journalism

## Rights of usage

The material may be used only by [Eurovision active members and sub-licensees](https://www.ebu.ch/eurovision-news/members-and-sublicensees).

## How to build and develop

This is a Webpack + React project.

* `npm install`
* `npm start`

Project should start at: http://localhost:8080

For developing please refer to `package.json`