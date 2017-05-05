# An ES6 template project for debugging on VisualStudioCode with babel and webpack-dev-server on macOS.

## 概要
JavaScriptの開発時にもXcodeなどのIDE並の環境を用意すべく、進化に追いつけていなかったフロントエンドの開発ツール周りを試して構築した。

最近はES2015でコードを書くのでbabelでES5に変換するのが必須。そうなると開発時のソースと実行時のスクリプトが異なるのでそのままではデバッグができない（ChromeのDeveloper Toolで止めてみても書いたコードとは違う表現のコード上で止まる）。
この問題を解決されるためにwebpackでは開発時のソースでデバッグを可能にするためにSource Mappingという手法を導入している。そしてこれを利用することでVisual Studio CodeからChromeへのRemote Debuggingが可能になる。

## 環境構築

### Visual Studio Codeのダウンロード
https://code.visualstudio.com/download

エディタは他に、[Atom](https://atom.io/)、[WebStorm](https://www.jetbrains.com/webstorm/)を試した。選定基準としては、
* クラスや変数定義でCommand+クリックなどで宣言に移動できる
* ブレークポイントでのデバッグができる
で選んだ。宣言への移動はWebStormももちろんできたが、有料だったので、Visual Studio Codeでデバッグもできることが分かったのでこちらしか試していない。

#### terminalからcodeコマンドで呼び出せるようにする

[Installationをちゃんと読む](https://code.visualstudio.com/docs/setup/mac)と、コマンド登録するやり方を教えてくれている。

> Open the Command Palette (⇧⌘P) and type 'shell command' to find the Shell Command: Install 'code' command in PATH command.

#### Debugger for Chromeプラグインのインストール

VisualStudioCodeもSublimeのようにプラグインで拡張が可能。
ChromeのRemoteデバッグに対応するためのプラグインを導入する。

![Debugger for Chromeプラグインのインストール](https://www.evernote.com/l/AAyOI0hv_9VH6LhD_dy-op_JjPYkrMRenv0)

### その他前提

nodeJS、yarnを入れる（yarnはfaceook製のnpm互換のパッケージマネージャ）。別にyarnでなく、npmでもよい。

#### yarnのインストール

```
$ npm install --g yarn
```

#### 使い方

```
$ yarn init

# npmコマンドのnpm install --saveと互換
$ yarn add [package名]


# npmコマンドのnpm install --save-devと互換
$ yarn add [package名] --dev

# npmでのnpm install -gコマンドと互換
$ yarn global add [package名]
```

## 新規プロジェクトを作る

```
$ mkdir MyVsProject
$ cd MyVsProject
$ yarn init
yarn init v0.19.1
question name (VisualSutudioCode_babel_webpack-dev-server):
question version (1.0.0):
question description:
question entry point (index.js):
question repository url (https://github.com/uskithub/VisualSutudioCode_babel_webpack-dev-server.git)
:
question author (Yusuke SAITO):
question license (MIT):
success Saved package.json
```

### グローバルでやること

webpackのインストール。webpackはモジュールバンドラという立ち位置。webpackが流行る前はgulpまたはgruntなどのタスクランナーでやっていた開発ソースからプロダクトモジュールへの変換部分を担っている。Web閲覧時、HTTP通信が増えるとオーバーヘッドが大きくなるので、必要なファイル数を減らすことが高速化＝ユーザ体験向上の基本戦略であり、複数のJSを一つにまとめたり、複数画像を一枚にしたり（CSSスプライトという）する。その他に、生のCSSはメンテナンス性が低いので、より少ない行数で書けて可読性も高めたSCSSなどの言語で開発を行い、コンパイルしてCSSにするなどの手法が一般的になっていて、このコンパイルも行う。

```
$ yarn global add webpack
```

### プロジェクト毎にやること

```
$ yarn add babel-loader@6.0.1 babel-core babel-preset-es2015 webpack webpack-dev-server --dev
```

babelはES2015のコードを一般的に使われているブラウザたちで動くJavaScript（ES5）にトランスパイルしてくれるツール。webpackと一緒に使う場合のインストール方法の[公式](https://babeljs.io/docs/setup/#installation)。

現時点（2017/05/04）でbabel-loaderは7.0.0が最新だが、6.0.1でないと動かないので注意。6.1.0以降ダメな模様。

できあがった package.json は以下のようになる。

```
{
  "name": "VisualSutudioCode_babel_webpack-dev-server",
  "version": "1.0.0",
  "main": "index.js",
  "repository": "https://github.com/uskithub/VisualSutudioCode_babel_webpack-dev-server.git",
  "author": "Yusuke SAITO",
  "license": "MIT",
  "devDependencies": {
    "babel-core": "^6.24.1",
    "babel-loader": "6.0.1",
    "babel-preset-es2015": "^6.24.1",
    "webpack": "^2.5.0",
    "webpack-dev-server": "^2.4.5"
  }
}
```

babelは設定を .babelrc に書くが、[package.jsonに含めることもできるようになったようだ](https://babeljs.io/docs/usage/babelrc/)。

```
{
  "name": "VisualSutudioCode_babel_webpack-dev-server",
  "version": "1.0.0",
  "main": "index.js",
  "repository": "https://github.com/uskithub/VisualSutudioCode_babel_webpack-dev-server.git",
  "author": "Yusuke SAITO",
  "license": "MIT",
  "devDependencies": {
    "babel-core": "^6.24.1",
    "babel-loader": "6.0.1",
    "babel-preset-es2015": "^6.24.1",
    "webpack": "^2.5.0",
    "webpack-dev-server": "^2.4.5"
  }
  , "babel": {
    "presets": ["es2015"]
  }
}
```

### ディレクトリ構成

以下の様にする。好みの問題。

```
MyVsProject
  ├─ public
  │   ├─ index.html
  │   └─ bundle.js    
  ├─ src
  │   └─ main.js  
  ├─ package.json
  ...
```

src以下のJavaScriptファイルをトランスパイルし、その他必要なJSファイルと結合してpublic以下でbundle.jsとする。
webpack-dev-serverのWebRootはpublicとし、http://127.0.0.1:3355/ でブラウザからアクセスするとpublic以下のindex.htmlが見えるようにwebpackを設定する。

### webpackの設定

webpack.config.jsを作る。

```
$ touch webpack.config.js
```

中身は以下の様にします。

```
const path = require('path');
const webpack = require('webpack')

module.exports = {
  devtool: '#source-map'
  , entry : [
    './src/main.js'
  ]
  , output : {
      path : path.join(__dirname, 'public')
      , filename: 'bundle.js'
      , publicPath: '/'
  }
  , devServer: {
    contentBase: 'public/'
    , historyApiFallback: true
    , port: 3355
    , inline: true
    , hot: true
  }
  , plugins : [
    new webpack.HotModuleReplacementPlugin()
    , new webpack.LoaderOptionsPlugin({
       debug: true
     })
  ]
  , module: {
    rules: [
      {
        test: /\.js$/
        , use: "babel-loader"
        , include: path.join(__dirname, 'src')
      }
    ]
  }
};
```

### 起動コマンド

webpackを起動してJSのトランスパイルする。source-mapを作成するには -d オプションを付ける（public以下にbundle.js.mapができていればOK）。

```
$ webpack -d
Hash: 76c42c13b7cfed42d475
Version: webpack 2.5.0
Time: 366ms
    Asset     Size  Chunks             Chunk Names
bundle.js  28.4 kB       0  [emitted]  main
   [0] ./src/main.js 212 bytes {0} [built]
   [1] multi ./src/main.js 28 bytes {0} [built]
```

webpack-dev-serverを起動する。

```
$ ./node_modules/.bin/webpack-dev-server -d
Project is running at http://localhost:3355/
webpack output is served from /
Content not from webpack is served from public/
404s will fallback to /index.html
Hash: 82a9fbefeac34fb7b091
Version: webpack 2.5.0
Time: 903ms
    Asset    Size  Chunks                    Chunk Names
bundle.js  896 kB       0  [emitted]  [big]  main
chunk    {0} bundle.js (main) 304 kB [entry] [rendered]
   [35] (webpack)/hot/emitter.js 77 bytes {0} [built]
   [36] ./src/main.js 212 bytes {0} [built]
   [37] (webpack)-dev-server/client?http://localhost:3355 5.68 kB {0} [built]
   [38] (webpack)/hot/dev-server.js 1.57 kB {0} [built]
   [39] ./~/ansi-html/index.js 4.26 kB {0} [built]
   [40] ./~/ansi-regex/index.js 135 bytes {0} [built]
   [42] ./~/events/events.js 8.33 kB {0} [built]
   [43] ./~/html-entities/index.js 231 bytes {0} [built]
   [47] ./~/punycode/punycode.js 14.7 kB {0} [built]
   [79] ./~/strip-ansi/index.js 161 bytes {0} [built]
   [80] ./~/url/url.js 23.3 kB {0} [built]
   [82] (webpack)-dev-server/client/overlay.js 3.73 kB {0} [built]
   [83] (webpack)-dev-server/client/socket.js 897 bytes {0} [built]
   [85] (webpack)/hot/log-apply-result.js 1.02 kB {0} [built]
   [86] multi (webpack)-dev-server/client?http://localhost:3355 webpack/hot/dev-server ./src/main.js 52 bytes {0} [buil
t]
     + 72 hidden modules
webpack: Compiled successfully.
```

上記をpackage.jsonにscriptsプロパティで設定してyarn runできるようにする。

```
{
  "name": "VisualSutudioCode_babel_webpack-dev-server",
  "version": "1.0.0",
  "main": "index.js",
  "repository": "https://github.com/uskithub/VisualSutudioCode_babel_webpack-dev-server.git",
  "author": "Yusuke SAITO",
  "license": "MIT",
  "devDependencies": {
    "babel-core": "^6.24.1",
    "babel-loader": "6.0.1",
    "babel-preset-es2015": "^6.24.1",
    "webpack": "^2.5.0",
    "webpack-dev-server": "^2.4.5"
  }
  , "scripts" : {
    "start" : "webpack-dev-server -d"
    , "build" : "webpack -d"
  }
  , "babel": {
    "presets": ["es2015"]
  }
}
```

```
$ yarn run start
```


### launch.jsonの設定

VisualStudioCodeのデバッグ向けの設定はlaunch.jsonに記述する。このjsonファイルはVisualStudioCode上で自動生成する（生成後は.vscode/launch.json で編集可能）。

![](https://www.evernote.com/l/AAzvG3hSlDRDG7YuU4PaLHUkPuUB5WQ8wd8)
![](https://www.evernote.com/l/AAyRNc2iFIlBeot_tBCkMoBA4cBx-FqgHbg)

デフォルトではlaunchとattachの2つの設定が作成されている。launchはVisualStudioCodeから（Remoteデバッグ可能な）Chromeを起動してデバッグを行う。一方attachは既に起動しているChromeに後からRemoteデバッグを紐付ける形でデバッグを行うことができる（ただし、Chromeに起動オプションを渡す必要あり）。

以下の様に設定すれば動く。ちなみにmacOSでの設定。WindowsはsourceMapPathOverridesが違ってくるはずだが正しい値までは試していないので分からない。

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "chrome",
            "request": "launch",
            "trace": true,
            "sourceMaps": true,
            "name": "Launch Chrome against localhost",
            "url": "http://localhost:3355",
            "webRoot": "${workspaceRoot}/public"
            , "sourceMapPathOverrides": {
                "webpack:///*": "${workspaceRoot}/src/*"
            }
        },
        {
            "type": "chrome",
            "request": "attach",
            "name": "Attach to Chrome",
            "port": 9222,
            "url": "http://localhost:3355",
            "webRoot": "${workspaceRoot}"
            , "sourceMapPathOverrides": {
                "webpack:///*": "${workspaceRoot}/src/*"
            }
        }
    ]
}
```

上手く行けば以下の様にブレークポイント（赤丸）で止まる。

![](https://www.evernote.com/l/AAwYCxXY4hNN0qPlt3tPpjfJuOd8GZZDd3g)

ちなみに設定が上手くいっていないと以下の様にブレークポイントが効かなくて悩まされることになる。

> Breakpoint ignored because generated code not found (source map problem?).

![](https://www.evernote.com/l/AAwtWxfPU9RIP6w9wBAGcaW72zS8XyIoI7s)

以下、直すまでのTips

* ログの出し方
  - launch.jsonで trace あるいは diagnosticLogging プロパティを true にする
* 疑う箇所
  - launch.jsonのsourceMapPathOverridesが正しくない場合も動かないので試してみる
  - babel-loaderのバージョン。6.0.1よりも新しいと2017-05-05現在動かなかった
  - ChromeのRemoteデバッグはChromeとVisualStudioCode間で専用ポート（9222）を通じてやり取りをするので、一度すべてのChromeのプロセスを閉じてからlaunchさせてみる