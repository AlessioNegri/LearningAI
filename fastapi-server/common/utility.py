import termcolor

def log(*message : str) -> None:
    """Log a message to console

    Args:
        message (str): Message to log
    """
    
    termcolor.cprint(text=message, color='blue', on_color='on_white', attrs=['bold'])