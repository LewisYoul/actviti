class SessionController < ApplicationController
  def destroy
    forget
    
    redirect_to unauthenticated_root_path
  end
end
