# Createing response objects for Esport app
from rest_framework.response import Response
from rest_framework import status



def api_response(
    result=None,  
    is_success=True,
    error_message=None,
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
):
    return Response(
        {
            "Status_code": status_code,
            "Is_Success": is_success,
            "Error_Message": error_message if error_message else "",
            "Result": result,
        },
        status=status_code,
    )


    