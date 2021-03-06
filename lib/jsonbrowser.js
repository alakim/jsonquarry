var JsonBrowser = (function($, $D, $C){var $H = $C.simple;
	var px = $C.css.unit.px,
		pc = $C.css.unit.pc;

	var Themes = {
		basic:{
			styles:{
				body:{
					"font-family":"Verdana, Arial, Sans-Serif",
					"font-size":px(16),
					" * ":{ // disable font boosting
						"max-height": "1000000em", // Chrome for Android
						"-moz-text-size-adjust": "none" // Firefox Mobile 
					},
					" .link":{
						color:"#00f",
						cursor:"pointer"
					},
					" .nodeName":{"font-weight":"bold"},
					" div.nodeName":{
						"float":"left"
					},
					" span.name":{"font-weight":"bold"},
					" .hint":{"font-size":"70%", color:"#ccc"},
					' .expandButtons':{fontSize:pc(80)}
				}
			}
		},
		light:{
			name:'светлое',
			styles:{}
		},
		dark:{
			name:'темное',
			styles:{
				body:{
					backgroundColor:'#012',
					color:'#eee',
					' a':{
						':link':{color:'#08f'},
						':visited':{color:'#08f'},
						':hover':{color:'#0cf'}
					},
					' .link':{
						color:'#08f',
						':hover':{color:'#0cf'}
					},
					' textarea':{
						backgroundColor:'#122',
						color:'#eef',
						fontFamily:'Courier New, Monospace'
					}
				}
			}
		}
	};

	function themeSelector(){with($H){
		return div({'class':'themeSelector'},
			'Оформление ',
			select(
				apply(Themes, function(s, k){
					return s.name?option({value:k}, s.name):null;
				})
			)
		);
	}}

	$C.css.writeStylesheet(Themes.basic.styles);
		
	function levelView(pnl, data, level){with($H){
		$(pnl).html((function(){with($H){
			if(typeof(data)!="object"){
				return span(data);
			}
			var maxLevel = 2;
			level = level || 0;
			if(level==maxLevel) return;
			return ol(
				apply(data, function(el, nm){
					return li(span({"class":"nodeName"}, nm), ": ",
						el==null?'null'
						:el instanceof Array? markup(
							span({"class":"link lnkObj", "data-name":nm}, format("[array of {0} elements]", el.length)), 
							div({"class":"pnlLevel", style:"display:none"})
						)
						:typeof(el)=="object"?markup(
							span({"class":"link lnkObj", "data-name":nm}, format("[object with {0} fields]", JsonQuarry.keys(el).length)),
							div({"class":"pnlLevel", style:"display:none"})
						)
						:el?el.toString()
							.replace(/&/ig, "&amp;")
							.replace(/</ig, "&lt;")
							.replace(/>/ig, "&gt;")
							:"[null]"
					);
				})
			);
		}})())
		.find(".lnkObj").click(function(){
			var pnl = $(this).parent().find(".pnlLevel");
			if(pnl.html().length){
				pnl.html("");
				pnl.fadeOut();
			}
			else{
				var nm = $(this).attr("data-name");
				levelView(pnl, data[nm]);
				pnl.fadeIn();
			}
		}).end();
	}}
	
	return {
		onload:function(){
			$('#selThemes').html(themeSelector());
			$('.themeSelector select').change(function(){
				var themeID = $(this).val();
				setTheme(themeID);
				localStorage.setItem('JsonQuarryTheme', themeID);
			}).end();

			function setTheme(themeID){
				// console.log('set theme %o', themeID);
				$('#theme').html($C.css.stylesheet(Themes[themeID].styles));
			}

			function initTheme(){
				var themeID = localStorage.getItem('JsonQuarryTheme') || 'light';
				setTheme(themeID);
				$('.themeSelector select').val(themeID);
			}

			initTheme();
		},
		init: function(idx, pnl, data){pnl=$(pnl);
			levelView(pnl, data)
			$(".btExecQuery").prop("disabled", false).click(function(){
				var query = $("#tbQuery").val();
				//var data = DB.prototype.jsondata;
				if(query || query.length){
					var F = new Function("data", "return "+query+";");
					var res = F(data);
					//data = F(data);
					levelView(pnl, res);
					$("#tbJsonRes"+idx).val(JSON.stringify(res));
				}
			});

			function transformData(idx){
				var json = $("#tbJsonRes"+idx).val();
				if(!json && !json.length) json = $("#tbJson"+idx).val();
				var data = JSON.parse(json);
				var rule = $("#tbTransformRule").val();
				rule = (new Function("", "return "+rule+";"))();
				var res = rule(data);
				$("#tbTransformRes"+idx).val(res);
			}

			$(".btTransform").prop("disabled", false).click(function(){
				transformData(1);
				transformData(2);
			});
		}
	};
})(jQuery, JsonQuarry.version('1.0.0'), Clarino.version('1.1.0'));
