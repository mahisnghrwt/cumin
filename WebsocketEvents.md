Websocket Events

========================================================================================================
Base Socket Msg Struct
	pid					int										project id
	eventName 			string									name of the event
	type				["add" | "remove" | "update"]			type of action
========================================================================================================



====================================================			
POST			/api/v1/project/{projectId}/user
====================================================
Socket Msg			
				pid					project id
				eventName 			"memberUpdate"
				user				new user
				type				"add"
====================================================