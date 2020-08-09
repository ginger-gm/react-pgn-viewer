{
  function flatten(a, acc = []) {
    for (var i = 0; i < a.length; i++) {
      if (Array.isArray(a[i])) {
        flatten(a[i], acc)
      } else {
        acc.push(a[i])
      }
    }
    return acc
  }

  function make_header(hn,hv) {
    var m = {}
    m[hn] = hv
    return m
  }

  function make_move(move_number, move, nags, ravs, commentBefore, commentAfter) {
    var m = {}
    if (move_number) m.move_number = move_number
    if (move) m.move = move
    if (nags && nags.length) m.nags = nags
    if (ravs && ravs.length) m.ravs = ravs
    if (commentBefore) m.commentBefore = commentBefore
    if (commentAfter) m.commentAfter = commentAfter
    return m
  }

  function make_rav(moves, result) {
    return {
      moves,
      result,
    }
  }

  function make_game(h, m, r) {
    h = h || []
    return {
      headers: h.reduce((acc, x) => Object.assign(acc, x), {}),
      moves: m || [],
      result: r,
    }
  }
}

start
  = newline* gs:(game newline*)* EOF
  { return gs.map(g => g[0]) }

game
  = h:headers?
    whitespace*
    mr:(
      m:movetext whitespace* r:result { return [m, r] } /
      r:result { return [null, r] }
    )
    whitespace*
    { return make_game(h, mr[0], mr[1]) }

EOF = !.
double_quote = '"'
semi_colon "semi-colon" = ";"
string =
  double_quote
  str:[^"]*
  double_quote
  { return str.join('') }
integer "integer" =
  a:[1-9] b:[0-9]*
  { return parseInt(a+b.join(''), 10) }
symbol =
  chars:[A-Za-z0-9_-]+
  { return chars.join('') }
ws = ' ' / '\f' / '\t'
whitespace "whitespace" =
  ws
  / newline
newline "newline" =
  "\r\n"
  / "\r"
  / "\n"
  / "\u2028"
  / "\u2029"
not_newline "not newline" =
  [^\r\n\u2028\u2029]

header "header" =
  whitespace*
  '['
  hn:symbol
  ws+
  hv:string
  not_newline*
  newline*
  { return make_header(hn.trim(), hv.trim()) }
headers = hs:header+ { return hs }

piece "piece" = [NKQRB]
rank "rank" = [a-h]
file "file" = [1-8]
check "check" = "+"
checkmate "checkmate" = "#"
capture "capture" = "x"
period "period" = "."
result "result" =
  "1-0" /
  "0-1" /
  "*" /
  "1/2-1/2" /
  "1/2" { return "1/2-1/2" } /
  "0.5" { return "1/2-1/2" } /
  "0.5-0.5" { return "1/2-1/2" }
move_number = mn:integer period (period period)? { return mn }
square = r:rank f:file { return r+f }
promotion = "=" [QRBN]
nag "nag" = chars:("$" integer) { return chars.join('') }
nag_alts "nag_alt" =
  '!' { return '$1' }
  / '?' { return '$2' }
  / '!!' { return '$3' }
  / '??' { return '$4' }
  / '!?' { return '$5' }
  / '?!' { return '$6' }
  / '□' { return '$7' }
  / '=' { return '$10' }
  / '=' { return '$11' }
  / '=' { return '$12' }
  / '∞' { return '$13' }
  / '⩲' { return '$14' }
  / '⩱' { return '$15' }
  / '±' { return '$16' }
  / '∓' { return '$17' }
  / '+-' { return '$18' }
  / '-+' { return '$19' }
  / '+-' { return '$20' }
  / '-+' { return '$21' }
  / '⨀' { return '$22' }
  / '⨀' { return '$23' }
  / '⟳' { return '$32' }
  / '⟳' { return '$33' }
  / '→' { return '$36' }
  / '→' { return '$37' }
  / '↑' { return '$40' }
  / '↑' { return '$41' }
  / '⇆' { return '$132' }
  / '⇆' { return '$133' }
  / 'D' { return '$220' }
continuation = period period period

// rest of line comment
rol_comment =
  whitespace*
  semi_colon
  whitespace*
  cc:not_newline*
  newline
  { return cc.join('').trim() }

comment_open "open comment" = "{"
comment_close "close comment" = "}"

comment_chars = [^}]
  comment =
    rol_comment /
    // multiple consecutive comments allowed
    comments:(
      whitespace*
      comment_open cc:comment_chars* comment_close
      nags:(whitespace+ n:nag { return n })* // allow nags between comments (is this in the PGN spec?)
      { return cc.join('').trim() + nags.join('').trim() }
    )*
    { return comments.join('').trim() }

pawn_half_move = (r:rank c:capture)? square promotion?
piece_half_move = piece capture? square
piece_disambiguation_half_move = piece (rank / file) capture? square
castle_half_move "castles" = ("O-O-O" / "O-O")
null_move "null move" = "--"

half_move =
  m:(continuation?
  (castle_half_move /
    piece_disambiguation_half_move /
    piece_half_move /
    pawn_half_move /
    null_move)
  (check / checkmate)?
  nag_alts?)
  { return flatten(m).join('').trim() }

move =
  commentBefore:comment
  whitespace*
  notation:(
    mn:move_number?
    whitespace*
    m:half_move?
    nags:(whitespace+ n:nag { return n })*
    commentAfter:comment
    ravs:(whitespace+ r:rav { return r })*
    { return { mn, m, nags, commentAfter, ravs } }
  )?
  {
    if (!notation) notation = {}
    const { mn, m, nags, commentAfter, ravs } = notation
    return make_move(mn, m, nags, ravs, commentBefore, commentAfter)
  }

movetext =
  first:move
  rest:(whitespace+ move)*
  { return first ? [first].concat(rest.map(function(m) { return m[1] })) : [] }

rav =
  "("
  whitespace*
  m:movetext
  whitespace*
  r:result?
  whitespace*
  ")"
  { return make_rav(m, r) }