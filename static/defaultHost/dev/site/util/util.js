'use strict';
define(['common/kernel/kernel'], function (kernel) {
	const msgs = {
			'not_login': '请先登录',
			'server_error': '网络连接或服务器故障'
		},
		util = {
			callapi: function (data, silent) {
				if (!silent) {
					kernel.showLoading();
				}
				return new Promise(function (resolve, reject) {
					if (window.WebSocket) {
						wsCall(data, done);
					} else {
						ajaxCall(data, done);
					}

					function done(data) {
						if (dataType(data) === 'error') {
							if (data.message === 'not_login') {
								//showlogin
							}
							if (!silent) {
								kernel.hint(msgs.hasOwnProperty(data.message) ? msgs[data.message] : data.message);
							}
							//reject(data);
						} else {
							resolve(data);
						}
						if (!silent) {
							kernel.hideLoading();
						}
					}
				});
			},
			upload: function (path, file, silent) {
				return new Promise(function (resolve, reject) {
					var x = new XMLHttpRequest;
					x.open('post', path + file.name, true);
					x.setRequestHeader('cid', localStorage.getItem('cid') || '');
					x.onreadystatechange = function () {
						if (x.readyState === 4) {
							if (x.status === 200) {
								let cid = x.getResponseHeader('cid');
								if (cid) {
									localStorage.setItem('cid', cid);
								}
								let data = x.responseText.parseJsex();
								if (data) {
									if (dataType(data) === 'error') {
										if (data.message === 'not_login') {
											//showlogin
										}
										if (!silent) {
											kernel.hint(msgs.hasOwnProperty(data.message) ? msgs[data.message] : data.message);
										}
										//reject(data);
									} else {
										resolve(data);
									}
								}
							} else {
								if (!silent) {
									kernel.hint(msgs.server_error);
								}
							}
							if (!silent) {
								kernel.hideLoading();
							}
						}
					};
					x.send(file);
					if (!silent) {
						kernel.showLoading();
					}
				});
			}
		};
	let ws, calltmo, cbs,
		i = 0,
		tocall = [];
	if (window.WebSocket) {
		makews();
	} else {
		cbs = {
			tocall: [],
			toback: []
		}
	}

	return util;

	function wsCall(o, cb) {
		if (ws) {
			cbs[i] = cb;
			ws.send(i++ + '\n' + toJsex(o));
		} else {
			if (!cbs) {
				cbs = [];
			}
			cbs.push({
				tocall: o,
				toback: cb
			});
		}
	}

	function ajaxCall(o, cb) {
		if (!calltmo) {
			calltmo = setTimeout(ajaxSubmit, 0);
		}
		cbs.tocall.push(o);
		cbs.toback.push(cb);
	}

	function ajaxSubmit() {
		let toback = cbs.toback,
			x = new XMLHttpRequest();
		x.open('post', '/', true);
		x.setRequestHeader('cid', localStorage.getItem('cid') || '');
		x.onreadystatechange = function () {
			if (x.readyState === 4) {
				let data;
				if (x.status === 200) {
					let cid = x.getResponseHeader('cid');
					if (cid) {
						localStorage.setItem('cid', cid);
					}
					data = x.responseText.parseJsex();
					if (data && dataType(data.value) === 'array') {
						for (let i = 0; i < toback.length; i++) {
							toback[i](data.value[i]);
						}
					}
				} else {
					data = Error('server_error');
					for (let i = 0; i < toback.length; i++) {
						toback[i](data);
					}
				}
			}
		};
		x.send(toJsex(cbs.tocall));
		cbs.tocall = [];
		cbs.toback = [];
		calltmo = undefined;
	}

	function makews() {
		let w = new WebSocket(location.origin.replace(/^http/, 'ws') + '/' + (localStorage.getItem('cid') || ''));
		w.addEventListener('open', function () {
			ws = w;
			if (cbs) {
				let c = cbs;
				cbs = [];
				for (let i = 0; i < c.length; i++) {
					wsCall(c[i].tocall, c[i].toback);
				}
			} else {
				cbs = [];
			}
		});
		w.addEventListener('message', function (evt) {
			let msg = evt.data.split('\n');
			if (msg.length === 3 && cbs.hasOwnProperty(msg[0])) {
				if (msg[1]) {
					localStorage.setItem('cid', msg[1]);
				}
				msg[2] = msg[2].parseJsex();
				if (msg[2]) {
					cbs[msg[0]](msg[2].value);
					delete cbs[msg[0]];
				}
			}
		});
		w.addEventListener('close', function () {
			ws = undefined;
			let keys = Object.keys(cbs);
			if (keys.length) {
				let data = Error('server_error');
				for (let i = 0; i < keys.length; i++) {
					cbs[keys[i]](data);
					delete cbs[keys[i]];
				}
			}
			makews();
		});
	}
});
