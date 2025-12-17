# Createing response objects for Esport app
from rest_framework.response import Response
from rest_framework import status


# Standardized API response format
def api_response(
    result=None,  
    is_sucess=False,
    error_message=None,
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
):
    # Constructing the response dictionary
    return Response(
        {
            "Status_code": status_code,
            "Is_Sucess": is_sucess,
            "Error_Message": error_message if error_message else "",
            "Result": result,
        },
        status=status_code,
    )


    