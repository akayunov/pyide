from pathlib import Path

ROUTING = {
    # '/vcs/diff',
    # '/vcs/commit'
    # 'command': '/server/command',

    'filelisting': '/server/file/listing',
    'gotodefinition': '/server/file/gotodefinition',
    'line': '/server/file/line',
    'autocomplete': '/server/file/autocomplete',
    'code': '/server/file/code',
    'tags': '/server/file/tags',

    'favicon': '/{file_name:favicon\.ico}',

    'client': Path(__file__).parent.parent.parent.parent / 'client'

}
